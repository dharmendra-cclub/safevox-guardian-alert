
import { supabase } from '@/integrations/supabase/client';
import { Location, SOSHistoryEntry } from './types';
import { Json } from '@/integrations/supabase/types';

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
    codewordUsed?: string,
    audioUrl?: string
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const historyEntry = {
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        location: location as unknown as Json, // Cast location to Json type for Supabase
        message,
        contact_ids: contactIds,
        trigger_type: triggerType,
        codeword_used: codewordUsed,
        audio_url: audioUrl
      };
      
      // Save to Supabase sos_history table
      const { error } = await supabase
        .from('sos_history')
        .insert(historyEntry);
      
      if (error) {
        console.error('Error saving SOS history:', error);
      }
    } catch (error) {
      console.error('Error saving SOS history:', error);
    }
  }

  public async fetchSOSHistory(): Promise<SOSHistoryEntry[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('sos_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Convert from Supabase data to our SOSHistoryEntry type
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        timestamp: item.timestamp,
        location: item.location as unknown as Location,
        message: item.message,
        contact_ids: item.contact_ids,
        trigger_type: item.trigger_type as 'button' | 'codeword' | 'crash' | 'timer',
        codeword_used: item.codeword_used,
        audio_url: item.audio_url
      }));
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
