
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sosService } from './sos';
import { CodeWord } from '@/types/voice-activation';

// Define SpeechRecognition interface
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private userId: string | null = null;
  private codeWords: CodeWord[] = [];
  private restartTimeout: number | null = null;
  
  constructor() {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
      this.setupRecognition();
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
    this.fetchCodeWords();
  }

  private async fetchCodeWords() {
    if (!this.userId) return;
    
    try {
      // Fetch custom codewords
      const { data, error } = await supabase
        .from('voice_activations')
        .select('*')
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
      // Transform to CodeWord format
      const customCodeWords: CodeWord[] = data.map(item => ({
        id: item.id,
        word: item.code_word,
        message: item.message,
        contacts: item.contacts || []
      }));
      
      // Add default codeword
      const defaultCodeWord: CodeWord = {
        id: 'default',
        word: 'Help me now',
        message: 'Emergency Alert: Need immediate assistance!',
        contacts: []
      };
      
      this.codeWords = [defaultCodeWord, ...customCodeWords];
      console.log('Loaded codewords:', this.codeWords);
    } catch (error) {
      console.error('Error fetching codewords:', error);
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript.toLowerCase())
        .join(' ');
      
      console.log('Transcript:', transcript);
      
      // Check if any codeword is in the transcript
      for (const codeWord of this.codeWords) {
        if (transcript.includes(codeWord.word.toLowerCase())) {
          this.triggerSOS(codeWord);
          break;
        }
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Only restart if it's not caused by an 'already-running' error
      if (event.error !== 'not-allowed' && this.isListening) {
        // Use a timeout to avoid immediate restart
        if (this.restartTimeout) {
          clearTimeout(this.restartTimeout);
        }
        
        console.log('Stopped listening for codewords');
        this.isListening = false;
        
        // Delayed restart
        this.restartTimeout = window.setTimeout(() => {
          if (this.recognition) {
            try {
              this.recognition.start();
              this.isListening = true;
              console.log('Restarted listening for codewords after error');
            } catch (e) {
              console.error('Error restarting speech recognition:', e);
            }
          }
        }, 2000);
      }
    };
    
    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Restart if still supposed to be listening and not already restarting
      if (this.isListening && !this.restartTimeout) {
        try {
          this.recognition?.start();
          console.log('Restarted listening for codewords');
        } catch (error) {
          console.error('Error restarting speech recognition:', error);
          // If restart fails, set timeout to try again
          this.isListening = false;
          this.restartTimeout = window.setTimeout(() => {
            this.startListening();
          }, 1000);
        }
      }
    };
  }

  public startListening() {
    if (!this.recognition) {
      toast.error('Speech recognition not supported in this browser');
      return false;
    }
    
    // Clear any pending restart
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    // If already listening, don't start again
    if (this.isListening) {
      console.log('Already listening for codewords');
      return true;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Started listening for codewords');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      // If failed because already started, mark as listening
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        this.isListening = true;
        return true;
      }
      
      return false;
    }
  }

  public stopListening() {
    if (!this.recognition) return false;
    
    // Clear any pending restart
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    // If not listening, no need to stop
    if (!this.isListening) {
      return true;
    }
    
    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('Stopped listening for codewords');
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      this.isListening = false;
      return false;
    }
  }

  private triggerSOS(codeWord: CodeWord) {
    toast.error(`Codeword detected: "${codeWord.word}"`);
    console.log('Triggering SOS for codeword:', codeWord);
    
    // Stop listening temporarily
    this.stopListening();
    
    // Activate SOS with the codeword message and contacts
    sosService.activate(codeWord.message, codeWord.contacts);
    
    // Resume listening after a short delay
    setTimeout(() => {
      this.startListening();
    }, 5000);
  }

  public isRecognitionActive(): boolean {
    return this.isListening;
  }
}

// Add SpeechRecognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
