
import { supabase } from '@/integrations/supabase/client';
import { audioRecordingService } from './AudioRecordingService';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row'];

class SOSService {
  private userId: string | null = null;
  private isActivated: boolean = false;
  private activationStartTime: number = 0;
  private recordingUrl: string | null = null;
  private emergencyContacts: EmergencyContact[] = [];

  constructor() {}

  public setUserId(userId: string) {
    this.userId = userId;
    audioRecordingService.setUserId(userId);
  }

  public async fetchEmergencyContacts() {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', this.userId);
      
      if (error) throw error;
      this.emergencyContacts = data || [];
      return data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }
  }

  public async activate(message?: string): Promise<boolean> {
    if (this.isActivated) return true;
    
    try {
      // Start recording
      const recordingStarted = await audioRecordingService.startRecording();
      if (!recordingStarted) {
        toast.error('Failed to start recording. Check microphone permissions.');
      }
      
      // Get user's location
      const location = await this.getCurrentLocation();
      
      // Get emergency contacts
      await this.fetchEmergencyContacts();
      
      // In a real application, here we would send SMS/notifications to emergency contacts
      // This would typically be done via a backend service
      console.log('SOS activated', {
        userId: this.userId,
        location,
        contacts: this.emergencyContacts,
        message: message || 'Emergency! I need help!'
      });
      
      this.isActivated = true;
      this.activationStartTime = Date.now();
      return true;
    } catch (error) {
      console.error('Error activating SOS:', error);
      return false;
    }
  }

  public async deactivate(): Promise<boolean> {
    if (!this.isActivated) return true;
    
    try {
      // Stop recording
      this.recordingUrl = await audioRecordingService.stopRecording();
      
      // In a real application, here we would send a follow-up notification
      // to emergency contacts indicating the emergency is over
      
      const duration = Math.floor((Date.now() - this.activationStartTime) / 1000);
      console.log('SOS deactivated', {
        userId: this.userId,
        duration: `${Math.floor(duration / 60)}:${duration % 60}`,
        recordingUrl: this.recordingUrl
      });
      
      this.isActivated = false;
      return true;
    } catch (error) {
      console.error('Error deactivating SOS:', error);
      return false;
    }
  }

  public async getCurrentLocation(): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  }

  public isSOSActivated(): boolean {
    return this.isActivated;
  }
}

export const sosService = new SOSService();
