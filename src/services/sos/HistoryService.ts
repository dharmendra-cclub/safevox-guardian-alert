
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
    codewordUsed: string = '',
    audioUrl: string = ''
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const historyEntry: SOSHistoryEntry = {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        location,
        message,
        contactIds,
        triggerType,
        codewordUsed,
        audioUrl
      };
      
      // Convert Location to a JSON object for storage
      const locationJson = location ? { lat: location.lat, lng: location.lng } : null;
      
      // Save to the sos_history table in Supabase
      const { error } = await supabase
        .from('sos_history')
        .insert({
          user_id: this.userId,
          timestamp: historyEntry.timestamp,
          location: locationJson,
          message: historyEntry.message,
          contact_ids: historyEntry.contactIds,
          trigger_type: historyEntry.triggerType,
          codeword_used: historyEntry.codewordUsed || null,
          audio_url: historyEntry.audioUrl || null
        });
      
      if (error) throw error;
      
      console.log('SOS history saved successfully:', historyEntry);
    } catch (error) {
      console.error('Error saving SOS history:', error);
    }
  }
  
  public async getSOSHistory(): Promise<SOSHistoryEntry[]> {
    if (!this.userId) return [];
    
    try {
      // Fetch history from sos_history table
      const { data, error } = await supabase
        .from('sos_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Convert the fetched data to SOSHistoryEntry format
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        timestamp: item.timestamp,
        location: item.location ? { 
          lat: parseFloat(item.location.lat), 
          lng: parseFloat(item.location.lng) 
        } : null,
        message: item.message,
        contactIds: item.contact_ids,
        triggerType: item.trigger_type as 'button' | 'codeword' | 'crash' | 'timer',
        codewordUsed: item.codeword_used || '',
        audioUrl: item.audio_url || ''
      }));
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
