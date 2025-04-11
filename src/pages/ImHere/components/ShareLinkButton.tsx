
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { toast } from 'sonner';
import { ShareLinkButtonProps } from '../types';

const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ userLocation }) => {
  const handleShareLink = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }
    
    const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Location',
          text: 'Here is my current location',
          url: locationUrl
        });
        toast.success('Location shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Failed to share location');
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(locationUrl)
        .then(() => toast.success('Location URL copied to clipboard'))
        .catch(() => toast.error('Failed to copy location URL'));
    }
  };

  return (
    <Button
      className="w-full bg-secondary hover:bg-secondary/90"
      onClick={handleShareLink}
    >
      <Share className="mr-2 h-4 w-4" />
      Share Location Link
    </Button>
  );
};

export default ShareLinkButton;
