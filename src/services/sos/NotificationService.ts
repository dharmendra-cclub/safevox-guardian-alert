
import { toast } from 'sonner';
import { contactsService } from './ContactsService';
import { locationService } from './LocationService';
import { Location } from './types';

class NotificationService {
  private audioStreamingUrl: string | null = null;
  private userId: string | null = null;

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public setAudioStreamingUrl(url: string) {
    this.audioStreamingUrl = url;
  }

  public getAudioStreamingUrl(): string | null {
    return this.audioStreamingUrl;
  }

  public async sendNotifications(
    message: string, 
    specificContactIds?: string[]
  ): Promise<boolean> {
    try {
      // Get contacts to notify
      const contactsToNotify = contactsService.getFilteredContacts(specificContactIds);
      
      // Get location
      const location = locationService.getLocation() || await locationService.getCurrentLocation();
      
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
      
      // Simulate sending SMS
      contactsToNotify.forEach(contact => {
        console.log(`Sending SMS to ${contact.name} (${contact.phone}): ${fullMessage}`);
      });
      
      if (contactsToNotify.length > 0) {
        toast.success(`Alert sent to ${contactsToNotify.length} contacts`);
      } else {
        toast.warning('No emergency contacts to notify');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
