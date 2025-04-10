
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
      const historyEntry: SOSHistoryEntry = {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        location,
        message,
        contactIds,
        triggerType,
        codewordUsed,
        audioUrl: `https://safevox.io/recordings/${this.userId}/${new Date().getTime()}.mp3` // Sample URL
      };
      
      console.log('Saving SOS history:', historyEntry);
      // In a real app, this would be saved to Supabase
      
      // Mock saving to the database
      const { error } = await supabase
        .from('sos_history')
        .insert({
          user_id: this.userId,
          timestamp: historyEntry.timestamp,
          location: historyEntry.location,
          message: historyEntry.message,
          contact_ids: historyEntry.contactIds,
          trigger_type: historyEntry.triggerType,
          codeword_used: historyEntry.codewordUsed,
          audio_url: historyEntry.audioUrl
        })
        .select()
        .maybeSingle();
      
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
      // In a real app, fetch from database
      // For now, return mock data
      const mockHistory: SOSHistoryEntry[] = [
        {
          userId: this.userId,
          timestamp: new Date().toISOString(),
          location: { lat: 17.3850, lng: 78.4867 },
          message: 'Emergency! I need help!',
          contactIds: ['1', '2', '3'],
          triggerType: 'button',
          audioUrl: `https://safevox.io/recordings/${this.userId}/sample1.mp3`
        },
        {
          userId: this.userId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          location: { lat: 17.3880, lng: 78.4850 },
          message: 'Help me now!',
          contactIds: ['1', '2'],
          triggerType: 'codeword',
          codewordUsed: 'police',
          audioUrl: `https://safevox.io/recordings/${this.userId}/sample2.mp3`
        },
        {
          userId: this.userId,
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          location: { lat: 17.3820, lng: 78.4890 },
          message: 'Accident detected! Need immediate help!',
          contactIds: ['1'],
          triggerType: 'crash',
          audioUrl: `https://safevox.io/recordings/${this.userId}/sample3.mp3`
        }
      ];
      
      return mockHistory;
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }
}

export const historyService = new HistoryService();
