
import { audioRecordingService } from '../AudioRecordingService';
import { toast } from 'sonner';
import { locationService } from './LocationService';
import { contactsService } from './ContactsService';
import { notificationService } from './NotificationService';
import { historyService } from './HistoryService';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

class SOSService {
  private userId: string | null = null;
  private isActivated: boolean = false;
  private activationStartTime: number = 0;
  private recordingUrl: string | null = null;
  private navigateCallback: ((path: string) => void) | null = null;
  private trackingId: string | null = null;
  private locationUpdateInterval: number | null = null;

  constructor() {
    // Location tracking is handled by locationService
  }

  public setUserId(userId: string) {
    this.userId = userId;
    audioRecordingService.setUserId(userId);
    contactsService.setUserId(userId);
    notificationService.setUserId(userId);
    historyService.setUserId(userId);
  }

  public registerNavigateCallback(callback: (path: string) => void) {
    this.navigateCallback = callback;
  }

  public navigateToSOSActivated() {
    if (this.navigateCallback) {
      this.navigateCallback('/sos-activated');
    } else {
      console.error('Navigate callback not registered');
      // If we're in a browser context, try to fallback to window.location
      if (typeof window !== 'undefined') {
        window.location.href = '/sos-activated';
      }
    }
  }

  public async fetchEmergencyContacts() {
    return contactsService.fetchEmergencyContacts();
  }

  public async activate(
    message?: string, 
    specificContactIds?: string[], 
    triggerType: 'button' | 'codeword' | 'crash' | 'timer' = 'button',
    codewordUsed: string = ''
  ): Promise<boolean> {
    if (this.isActivated) return true;
    
    try {
      // Generate tracking ID
      this.trackingId = uuidv4();
      
      // Start recording
      const recordingStarted = await audioRecordingService.startRecording();
      if (!recordingStarted) {
        toast.error('Failed to start recording. Check microphone permissions.');
      }
      
      // Generate audio streaming URL (in a real app, this would be a real streaming URL)
      const audioStreamingUrl = `https://safevox.io/stream/${this.userId}`;
      notificationService.setAudioStreamingUrl(audioStreamingUrl);
      
      // Get emergency contacts - either all or specific ones
      await contactsService.fetchEmergencyContacts();
      
      // Get current location for initial setup
      const location = locationService.getLocation() || await locationService.getCurrentLocation();
      
      // Create real-time tracking session
      if (this.userId && location) {
        const { error } = await supabase
          .from('sos_tracking_sessions')
          .insert({
            tracking_id: this.trackingId,
            user_id: this.userId,
            is_sos_active: true,
            last_location: location,
            audio_url: audioStreamingUrl,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error creating tracking session:', error);
        } else {
          // Set up periodic location updates to the tracking session
          this.startLocationUpdates();
        }
      }
      
      // Generate public tracking URL to share with contacts
      const trackingUrl = `${window.location.origin}/track?id=${this.trackingId}`;
      
      // Send notifications with the tracking URL
      const customMsg = message || 'Emergency! I need help!';
      const fullMessage = `${customMsg} Track my location and hear audio: ${trackingUrl}`;
      
      await notificationService.sendNotifications(fullMessage, specificContactIds);
      
      // Save the SOS activation to history
      const contactsToNotify = contactsService.getFilteredContacts(specificContactIds);
      await historyService.saveSOSHistory(
        location, 
        customMsg, 
        contactsToNotify.map(c => c.id),
        triggerType,
        codewordUsed,
        audioStreamingUrl,
        this.trackingId
      );
      
      this.isActivated = true;
      this.activationStartTime = Date.now();
      return true;
    } catch (error) {
      console.error('Error activating SOS:', error);
      return false;
    }
  }

  private startLocationUpdates() {
    // Update location every 10 seconds
    this.locationUpdateInterval = window.setInterval(async () => {
      try {
        if (!this.isActivated || !this.trackingId || !this.userId) {
          this.stopLocationUpdates();
          return;
        }
        
        const location = locationService.getLocation();
        if (!location) return;
        
        // Update tracking session with latest location
        await supabase
          .from('sos_tracking_sessions')
          .update({
            last_location: location,
            updated_at: new Date().toISOString()
          })
          .eq('tracking_id', this.trackingId);
        
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }, 10000); // 10 seconds
  }

  private stopLocationUpdates() {
    if (this.locationUpdateInterval !== null) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  public async shareLocation(
    message: string,
    specificContactIds: string[]
  ): Promise<string | null> {
    try {
      // Generate tracking ID
      const trackingId = uuidv4();
      
      // Get current location
      const location = locationService.getLocation() || await locationService.getCurrentLocation();
      if (!location || !this.userId) return null;
      
      // Create real-time tracking session (without SOS/audio)
      const { error } = await supabase
        .from('sos_tracking_sessions')
        .insert({
          tracking_id: trackingId,
          user_id: this.userId,
          is_sos_active: false, // Just location sharing, not SOS
          last_location: location,
          audio_url: null,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating location sharing session:', error);
        return null;
      }
      
      // Generate public tracking URL
      const trackingUrl = `${window.location.origin}/track?id=${trackingId}`;
      
      // Return the tracking URL to use in notifications
      return trackingUrl;
    } catch (error) {
      console.error('Error sharing location:', error);
      return null;
    }
  }

  public async deactivate(): Promise<boolean> {
    if (!this.isActivated) return true;
    
    try {
      // Stop recording
      this.recordingUrl = await audioRecordingService.stopRecording();
      
      // Stop location updates
      this.stopLocationUpdates();
      
      // Update tracking session status (rather than deleting, mark as inactive)
      if (this.trackingId) {
        await supabase
          .from('sos_tracking_sessions')
          .update({
            is_sos_active: false,
            deactivated_at: new Date().toISOString()
          })
          .eq('tracking_id', this.trackingId);
      }
      
      // Send follow-up notification (in a real app)
      const duration = Math.floor((Date.now() - this.activationStartTime) / 1000);
      console.log('SOS deactivated', {
        userId: this.userId,
        duration: `${Math.floor(duration / 60)}:${duration % 60}`,
        recordingUrl: this.recordingUrl
      });
      
      this.isActivated = false;
      this.trackingId = null;
      return true;
    } catch (error) {
      console.error('Error deactivating SOS:', error);
      return false;
    }
  }

  public async getCurrentLocation() {
    return locationService.getCurrentLocation();
  }

  public simulateAccident(): void {
    if (this.isActivated) return;
    
    toast.error('Accident detected!');
    
    // Activate SOS with a specific message for accident
    this.activate('Accident detected! Need immediate help!', undefined, 'crash');
  }

  public isSOSActivated(): boolean {
    return this.isActivated;
  }

  public getAudioStreamingUrl(): string | null {
    return notificationService.getAudioStreamingUrl();
  }

  public getTrackingUrl(): string | null {
    if (!this.trackingId) return null;
    return `${window.location.origin}/track?id=${this.trackingId}`;
  }
}

export const sosService = new SOSService();
