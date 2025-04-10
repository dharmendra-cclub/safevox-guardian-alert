
import { supabase } from '@/integrations/supabase/client';
import { EmergencyContact } from './types';

class ContactsService {
  private userId: string | null = null;
  private emergencyContacts: EmergencyContact[] = [];

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public async fetchEmergencyContacts(): Promise<EmergencyContact[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
      // Transform the data to make sure it has all required properties
      const contacts = data?.map(contact => ({
        ...contact,
        relationship: contact.relationship || '' // Add relationship if missing
      })) || [];
      
      this.emergencyContacts = contacts;
      return contacts;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }
  }

  public getEmergencyContacts(): EmergencyContact[] {
    return this.emergencyContacts;
  }

  public getFilteredContacts(specificContactIds?: string[]): EmergencyContact[] {
    if (!specificContactIds || specificContactIds.length === 0) {
      return this.emergencyContacts;
    }
    
    return this.emergencyContacts.filter(contact => 
      specificContactIds.includes(contact.id)
    );
  }
}

export const contactsService = new ContactsService();
