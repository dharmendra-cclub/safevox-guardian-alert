
import { supabase } from '@/integrations/supabase/client';
import { CodeWord, VoiceActivationDB } from '@/types/voice-activation';
import { toast } from 'sonner';

export const fetchCodeWords = async (userId: string): Promise<CodeWord[]> => {
  try {
    const { data, error } = await supabase
      .from('voice_activations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform the data from Supabase format to component format
    return data?.map((item: VoiceActivationDB) => ({
      id: item.id,
      word: item.code_word,
      message: item.message,
      contacts: item.contacts || []
    })) || [];
  } catch (error) {
    console.error('Error fetching code words:', error);
    toast.error('Failed to load voice activations');
    return [];
  }
};

export const addCodeWordToDatabase = async (
  userId: string, 
  codeWord: string, 
  message: string,
  contactIds: string[] = []
): Promise<CodeWord | null> => {
  try {
    const { data, error } = await supabase
      .from('voice_activations')
      .insert({
        user_id: userId,
        code_word: codeWord,
        message: message || 'Emergency alert!',
        contacts: contactIds
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform the newly added data to match our component format
    return {
      id: data.id,
      word: data.code_word,
      message: data.message,
      contacts: data.contacts || []
    };
  } catch (error) {
    console.error('Error adding codeword:', error);
    toast.error('Failed to add codeword');
    return null;
  }
};

export const deleteCodeWordFromDatabase = async (userId: string, codeWordId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('voice_activations')
      .delete()
      .eq('id', codeWordId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting codeword:', error);
    toast.error('Failed to delete codeword');
    return false;
  }
};

export const fetchEmergencyContacts = async (userId: string): Promise<Record<string, string>> => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('id, name')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform the data into a map of id -> name
    return data.reduce((acc: Record<string, string>, contact) => {
      acc[contact.id] = contact.name;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return {};
  }
};
