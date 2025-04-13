import { audioRecordingService } from '../AudioRecordingService';
import { toast } from 'sonner';
import { locationService } from './LocationService';
import { contactsService } from './ContactsService';
import { notificationService } from './NotificationService';
import { historyService } from './HistoryService';

class SOSService {
  private userId: string | null = null;
  private isActivated: boolean = false;
  private activationStartTime: number = 0;
  private recordingUrl: string | null = null;
  private navigateCallback: ((path: string) => void) | null = null;

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

  public async activate(message?: string, specificContactIds?: string[], triggerType: 'button' | 'codeword' | 'crash' | 'timer' = 'button', codewordUsed: string = ''): Promise<boolean> {
    if (this.isActivated) return true;
    
    try {
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
      
      // Send notifications
      await notificationService.sendNotifications(message || '', specificContactIds);
      
      // Get current location for history
      const location = locationService.getLocation() || await locationService.getCurrentLocation();
      
      // Save the SOS activation to history
      const contactsToNotify = contactsService.getFilteredContacts(specificContactIds);
      await historyService.saveSOSHistory(
        location, 
        message || 'Emergency! I need help!', 
        contactsToNotify.map(c => c.id),
        triggerType,
        codewordUsed,
        audioStreamingUrl
      );
      
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

  public async getCurrentLocation() {
    return locationService.getCurrentLocation();
  }

  public simulateAccident(): void {
    if (this.isActivated) return;
    
    toast.error('Accident detected!');
    
    // Activate SOS with a specific message for accident
    this.activate(
      'Accident detected! Need immediate help!', 
      undefined, 
      'crash'
    );
  }

  public isSOSActivated(): boolean {
    return this.isActivated;
  }

  public getAudioStreamingUrl(): string | null {
    return notificationService.getAudioStreamingUrl();
  }
}

export const sosService = new SOSService();
