
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
    contactIds: string[]
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const historyEntry: SOSHistoryEntry = {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        location,
        message,
        contactIds
      };
      
      // In a real app, save to a 'sos_history' table
      console.log('Saving SOS history:', historyEntry);
    } catch (error) {
      console.error('Error saving SOS history:', error);
    }
  }
}

export const historyService = new HistoryService();
