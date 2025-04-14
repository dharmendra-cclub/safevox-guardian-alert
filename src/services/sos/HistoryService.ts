
import { supabase } from '@/integrations/supabase/client';
import { Location } from './types';

interface SOSHistoryEntry {
  id: string;
  userId: string;
  timestamp: string;
  location: Location | null;
  message: string;
  contactIds: string[];
  triggerType: 'button' | 'codeword' | 'crash' | 'timer';
  codewordUsed?: string;
  audioUrl?: string;
  trackingId?: string; // New field for tracking URL
}

class HistoryService {
  private userId: string | null = null;

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public async saveSOSHistory(
    location: Location | null,
    message: string,
    contactIds: string[],
    triggerType: 'button' | 'codeword' | 'crash' | 'timer' = 'button',
    codewordUsed: string = '',
    audioUrl: string = '',
    trackingId: string = ''
  ): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const { error } = await supabase
        .from('sos_history')
        .insert({
          user_id: this.userId,
          location: location ? location : null,
          message: message,
          contact_ids: contactIds,
          trigger_type: triggerType,
          codeword_used: codewordUsed || null,
          audio_url: audioUrl || null,
          tracking_id: trackingId || null
        });
      
      if (error) {
        console.error('Error saving SOS history:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving SOS history:', error);
      return false;
    }
  }

  public async getSOSHistory(): Promise<SOSHistoryEntry[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('sos_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching SOS history:', error);
        return [];
      }
      
      // Map the database entries to our application type
      // Ensure triggerType is one of the allowed literal types
      return data.map(entry => {
        // Validate the trigger_type value and default to 'button' if invalid
        let triggerType: 'button' | 'codeword' | 'crash' | 'timer' = 'button';
        if (
          entry.trigger_type === 'button' || 
          entry.trigger_type === 'codeword' || 
          entry.trigger_type === 'crash' || 
          entry.trigger_type === 'timer'
        ) {
          triggerType = entry.trigger_type;
        }
        
        return {
          id: entry.id,
          userId: entry.user_id,
          timestamp: entry.timestamp,
          location: entry.location,
          message: entry.message,
          contactIds: entry.contact_ids,
          triggerType: triggerType,
          codewordUsed: entry.codeword_used,
          audioUrl: entry.audio_url,
          trackingId: entry.tracking_id
        };
      });
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
