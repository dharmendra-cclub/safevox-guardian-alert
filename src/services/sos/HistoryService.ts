
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
      // Convert the Location object to a format suitable for Supabase jsonb column
      const locationData = location ? {
        lat: location.lat,
        lng: location.lng
      } : null;
      
      // Create record in Supabase
      const { error } = await supabase
        .from('sos_history')
        .insert({
          user_id: this.userId,
          timestamp: new Date().toISOString(),
          location: locationData,
          message,
          contact_ids: contactIds,
          trigger_type: triggerType,
          codeword_used: codewordUsed || null,
          audio_url: audioUrl || null
        });
        
      if (error) {
        throw error;
      }
      
      console.log('SOS history saved successfully');
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
        
      if (error) {
        throw error;
      }
      
      // Transform data from DB format to our app format
      return data.map(item => {
        // Parse location data from jsonb format
        let locationData: Location | null = null;
        if (item.location && typeof item.location === 'object') {
          const loc = item.location as { lat: number; lng: number };
          if (loc.lat !== undefined && loc.lng !== undefined) {
            locationData = {
              lat: loc.lat,
              lng: loc.lng
            };
          }
        }
        
        return {
          id: item.id,
          userId: item.user_id,
          timestamp: item.timestamp,
          location: locationData,
          message: item.message,
          contactIds: item.contact_ids,
          triggerType: item.trigger_type,
          codewordUsed: item.codeword_used,
          audioUrl: item.audio_url
        };
      });
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
