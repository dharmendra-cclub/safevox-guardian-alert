
// Types for SOS service

// Location type
export interface Location {
  lat: number;
  lng: number;
  [key: string]: any; // Add index signature to make it compatible with Json type
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

// SOS history entry
export interface SOSHistoryEntry {
  id: string;
  user_id: string;
  timestamp: string;
  location: Location | null;
  message: string;
  contact_ids: string[];
  trigger_type?: 'button' | 'codeword' | 'crash' | 'timer';
  codeword_used?: string;
  audio_url?: string;
}
