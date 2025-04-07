
import { supabase } from '@/integrations/supabase/client';

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private userId: string | null = null;
  private fileName: string = '';
  private isRecording: boolean = false;

  constructor() {}

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) return true;
      
      this.audioChunks = [];
      this.fileName = `recording-${new Date().toISOString()}`;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  public async stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.stream || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.addEventListener('stop', async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const url = await this.uploadRecording(audioBlob);
          this.isRecording = false;
          this.stopAllTracks();
          resolve(url);
        } catch (error) {
          console.error('Error processing recording:', error);
          this.isRecording = false;
          this.stopAllTracks();
          resolve(null);
        }
      });

      this.mediaRecorder.stop();
    });
  }

  private stopAllTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }

  private async uploadRecording(audioBlob: Blob): Promise<string | null> {
    try {
      if (!this.userId) throw new Error('User ID not set');
      
      const filePath = `${this.userId}/${this.fileName}.webm`;
      
      const { data, error } = await supabase.storage
        .from('recordings')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(filePath);
      
      // Save recording metadata to database
      await supabase.from('recordings').insert({
        user_id: this.userId,
        name: this.fileName,
        recording_url: urlData.publicUrl,
        duration: '00:00' // In a real app, calculate duration
      });
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading recording:', error);
      return null;
    }
  }
}

export const audioRecordingService = new AudioRecordingService();
