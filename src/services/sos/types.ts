
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
  relationship: string;
  created_at: string;
  [key: string]: any;
}

// SOS history entry
export interface SOSHistoryEntry {
  userId: string;
  timestamp: string;
  location: Location | null;
  message: string;
  contactIds: string[];
}
