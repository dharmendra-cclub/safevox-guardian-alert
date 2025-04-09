
import { Database } from '@/integrations/supabase/types';

// Base contact type from database
type DbContact = Database['public']['Tables']['emergency_contacts']['Row'];

// Enhanced contact type with UI selection state
export interface Contact extends DbContact {
  selected?: boolean;
}

// Props for the ContactSelector component
export interface ContactSelectorProps {
  contacts: Contact[];
  loading: boolean;
  toggleContactSelection: (id: string) => void;
}

// Props for the LocationShareButton component
export interface LocationShareButtonProps {
  onSendLocation: () => Promise<void>;
  sending: boolean;
  loading: boolean;
  contactsCount: number;
}

// Props for the ShareLinkButton component
export interface ShareLinkButtonProps {
  userLocation: {lat: number, lng: number} | null;
}
