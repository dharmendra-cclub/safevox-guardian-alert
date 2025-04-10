
import { audioRecordingService } from '../AudioRecordingService';
import { toast } from 'sonner';
import { locationService } from './LocationService';
import { contactsService } from './ContactsService';
import { notificationService } from './NotificationService';
import { historyService } from './HistoryService';
import { Location } from './types';

class SOSService {
  private userId: string | null = null;
  private isActivated: boolean = false;
  private activationStartTime: number = 0;
  private recordingUrl: string | null = null;
  private activationType: 'button' | 'codeword' | 'crash' | 'timer' = 'button';
  private codewordUsed: string | null = null;

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

  public async fetchEmergencyContacts() {
    return contactsService.fetchEmergencyContacts();
  }

  public setActivationType(type: 'button' | 'codeword' | 'crash' | 'timer', codeword: string | null = null) {
    this.activationType = type;
    this.codewordUsed = codeword;
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
        this.activationType,
        this.codewordUsed
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
        recordingUrl: this.recordingUrl,
        activationType: this.activationType,
        codewordUsed: this.codewordUsed
      });
      
      // Reset activation type
      this.activationType = 'button';
      this.codewordUsed = null;
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
    
    // Set activation type to crash
    this.setActivationType('crash');
    
    // Activate SOS with a specific message for accident
    this.activate('Accident detected! Need immediate help!');
  }

  public async addLocationShareToHistory(location: Location | null, contactIds: string[]): Promise<void> {
    if (!this.userId) return;
    
    try {
      const message = "Location shared via SMS";
      await historyService.saveSOSHistory(
        location,
        message,
        contactIds,
        'button',  // Using button as activation type for location sharing
        null
      );
    } catch (error) {
      console.error('Error saving location share to history:', error);
    }
  }

  public isSOSActivated(): boolean {
    return this.isActivated;
  }

  public getAudioStreamingUrl(): string | null {
    return notificationService.getAudioStreamingUrl();
  }

  public getActivationType(): string {
    return this.activationType;
  }

  public getCodewordUsed(): string | null {
    return this.codewordUsed;
  }
}

export const sosService = new SOSService();
