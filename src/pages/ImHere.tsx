
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Share } from 'lucide-react';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Database } from '@/integrations/supabase/types';

type DbContact = Database['public']['Tables']['emergency_contacts']['Row'];

interface Contact extends DbContact {
  selected?: boolean;
}

const ImHere: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setContacts(data.map(contact => ({
          ...contact,
          selected: false
        })));
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load emergency contacts');
      } finally {
        setLoading(false);
      }
    };

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            toast.error('Unable to get your location');
          }
        );
      } else {
        toast.error('Geolocation is not supported by this browser');
      }
    };

    fetchContacts();
    getUserLocation();
  }, [user]);

  const toggleContactSelection = (id: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id 
        ? { ...contact, selected: !contact.selected } 
        : contact
    ));
  };

  const handleSendLocation = async () => {
    const selectedContacts = contacts.filter(contact => contact.selected);
    
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }
    
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }
    
    setSending(true);
    
    try {
      // In a real app, this would send SMS or notifications with location
      // For now, we'll just simulate the process
      
      const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
      console.log('Sending location to:', selectedContacts, 'URL:', locationUrl);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Location sent to ${selectedContacts.length} contacts`);
      navigate('/home');
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Failed to send location');
    } finally {
      setSending(false);
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center bg-card border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Share My Location</h1>
      </div>

      {/* Map View */}
      <div className="relative flex-1">
        <MapView 
          satelliteView={true} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />
        
        {/* Share button */}
        <Button
          className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm"
          onClick={handleShareLink}
        >
          <Share className="mr-2 h-4 w-4" />
          Share Link
        </Button>
      </div>

      {/* Contacts Selection */}
      <div className="p-4 bg-card border-t border-border">
        <h2 className="text-lg font-semibold mb-3">Send to Emergency Contacts</h2>
        
        {loading ? (
          <div className="py-4 text-center">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No emergency contacts added yet
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={contact.id} 
                  checked={contact.selected}
                  onCheckedChange={() => toggleContactSelection(contact.id)}
                />
                <Label htmlFor={contact.id} className="flex-1">
                  {contact.name} - {contact.phone}
                </Label>
              </div>
            ))}
          </div>
        )}
        
        <Button
          onClick={handleSendLocation}
          className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
          disabled={sending || loading || contacts.length === 0}
        >
          {sending ? 'Sending...' : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send My Location
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImHere;
