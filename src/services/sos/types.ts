
// Types for SOS service
import { Json } from "@/integrations/supabase/types";

// Location type
export interface Location {
  lat: number;
  lng: number;
}

// Emergency contact type from database
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  initials?: string;
  updated_at?: string;
  created_at: string;
  relationship?: string;
  [key: string]: any;
}

// SOS history entry type
export interface SOSHistoryEntry {
  id?: string;
  user_id: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  message: string;
  contact_ids: string[];
  trigger_type?: 'button' | 'codeword' | 'crash' | 'timer';
  codeword_used?: string | null;
  audio_url?: string | null;
}
