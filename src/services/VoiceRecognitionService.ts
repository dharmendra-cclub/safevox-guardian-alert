
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sosService } from './SOSService';
import { CodeWord } from '@/types/voice-activation';

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private userId: string | null = null;
  private codeWords: CodeWord[] = [];
  
  constructor() {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
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
      // Restart if error occurs
      if (this.isListening) {
        this.stopListening();
        this.startListening();
      }
    };
    
    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      // Restart if still supposed to be listening
      if (this.isListening) {
        this.recognition?.start();
      }
    };
  }

  public startListening() {
    if (!this.recognition) {
      toast.error('Speech recognition not supported in this browser');
      return false;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Started listening for codewords');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  public stopListening() {
    if (!this.recognition) return false;
    
    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('Stopped listening for codewords');
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
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
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
