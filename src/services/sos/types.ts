
// Types for SOS service

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

// SOS history entry
export interface SOSHistoryEntry {
  id?: string;
  userId: string;
  timestamp: string;
  location: Location | null;
  message: string;
  contactIds: string[];
  triggerType?: 'button' | 'codeword' | 'crash' | 'timer';
  codewordUsed?: string;
  audioUrl?: string;
}
