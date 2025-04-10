
import { supabase } from '@/integrations/supabase/client';
import { Location, SOSHistoryEntry } from './types';

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
    codewordUsed: string | null = null
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      // Convert Location to a simple object that can be stored as JSON
      const historyEntry = {
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        location: location ? { ...location } : null, // Spread to create a plain object
        message,
        contact_ids: contactIds,
        trigger_type: triggerType,
        codeword_used: codewordUsed,
        audio_url: `https://safevox.io/recordings/${this.userId}/${new Date().getTime()}.mp3`
      };
      
      const { error } = await supabase
        .from('sos_history')
        .insert(historyEntry);
      
      if (error) {
        console.error('Error inserting history to database:', error);
      }
    } catch (error) {
      console.error('Error saving SOS history:', error);
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
      
      if (error) throw error;
      
      return data as SOSHistoryEntry[] || [];
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
