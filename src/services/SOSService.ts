
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
  private userLocation: { lat: number, lng: number } | null = null;
  private locationWatchId: number | null = null;
  private audioStreamingUrl: string | null = null;

  constructor() {
    // Start watching location immediately
    this.startLocationTracking();
  }

  public setUserId(userId: string) {
    this.userId = userId;
    audioRecordingService.setUserId(userId);
  }

  private startLocationTracking() {
    if (navigator.geolocation) {
      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }
  }

  private stopLocationTracking() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
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

  public async activate(message?: string, specificContactIds?: string[]): Promise<boolean> {
    if (this.isActivated) return true;
    
    try {
      // Start recording
      const recordingStarted = await audioRecordingService.startRecording();
      if (!recordingStarted) {
        toast.error('Failed to start recording. Check microphone permissions.');
      }
      
      // Generate audio streaming URL (in a real app, this would be a real streaming URL)
      this.audioStreamingUrl = `https://safevox.io/stream/${this.userId}`;
      
      // Get emergency contacts - either all or specific ones
      await this.fetchEmergencyContacts();
      
      let contactsToNotify = this.emergencyContacts;
      if (specificContactIds && specificContactIds.length > 0) {
        contactsToNotify = this.emergencyContacts.filter(contact => 
          specificContactIds.includes(contact.id)
        );
      }
      
      // Ensure we have the latest location
      const location = this.userLocation || await this.getCurrentLocation();
      
      // Prepare SMS message
      const defaultMessage = 'Emergency! I need help!';
      const userMessage = message || defaultMessage;
      const locationUrl = location 
        ? `https://maps.google.com/?q=${location.lat},${location.lng}` 
        : '';
      const audioUrl = this.audioStreamingUrl || '';
      
      const fullMessage = `${userMessage} Track my location: ${locationUrl} Listen: ${audioUrl}`;
      
      // In a real application, send SMS via a backend service
      // For demo purposes, we'll log the details
      console.log('SOS activated', {
        userId: this.userId,
        location,
        contacts: contactsToNotify,
        message: fullMessage,
        audioStreamingUrl: this.audioStreamingUrl
      });
      
      // Save the SOS activation to history
      await this.saveSOSHistory(location, userMessage, contactsToNotify.map(c => c.id));
      
      // Simulate sending SMS
      contactsToNotify.forEach(contact => {
        console.log(`Sending SMS to ${contact.name} (${contact.phone}): ${fullMessage}`);
      });
      
      if (contactsToNotify.length > 0) {
        toast.success(`Alert sent to ${contactsToNotify.length} contacts`);
      } else {
        toast.warning('No emergency contacts to notify');
      }
      
      this.isActivated = true;
      this.activationStartTime = Date.now();
      return true;
    } catch (error) {
      console.error('Error activating SOS:', error);
      return false;
    }
  }

  private async saveSOSHistory(
    location: { lat: number, lng: number } | null,
    message: string,
    contactIds: string[]
  ) {
    if (!this.userId) return;
    
    try {
      // In a real app, save to a 'sos_history' table
      console.log('Saving SOS history:', {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        location,
        message,
        contactIds
      });
    } catch (error) {
      console.error('Error saving SOS history:', error);
    }
  }

  public async deactivate(): Promise<boolean> {
    if (!this.isActivated) return true;
    
    try {
      // Stop recording
      this.recordingUrl = await audioRecordingService.stopRecording();
      
      // Send follow-up notification (in a real app)
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
    // Return cached location if available
    if (this.userLocation) {
      return this.userLocation;
    }
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocation = location;
          resolve(location);
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  public simulateAccident(): void {
    if (this.isActivated) return;
    
    toast.error('Accident detected!');
    
    // Activate SOS with a specific message for accident
    this.activate('Accident detected! Need immediate help!');
  }

  public isSOSActivated(): boolean {
    return this.isActivated;
  }

  public getAudioStreamingUrl(): string | null {
    return this.audioStreamingUrl;
  }
}

export const sosService = new SOSService();
