
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { LocationShareButtonProps } from '../types';

const LocationShareButton: React.FC<LocationShareButtonProps> = ({
  onSendLocation,
  sending,
  loading,
  contactsCount
}) => {
  return (
    <Button
      onClick={onSendLocation}
      className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
      disabled={sending || loading || contactsCount === 0}
    >
      {sending ? 'Sending...' : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send My Location via SMS
        </>
      )}
    </Button>
  );
};

export default LocationShareButton;
