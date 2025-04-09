
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import MapView from '@/components/map/MapView';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ContactSelector from './components/ContactSelector';
import LocationShareButton from './components/LocationShareButton';
import ShareLinkButton from './components/ShareLinkButton';
import { Contact } from './types';

const ImHerePage: React.FC = () => {
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
      // In a real app, we would send SMS with the Supabase Edge Function
      // For now, we'll simulate the SMS sending process
      const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
      const message = `Emergency: I'm sharing my real-time location with you. Track me here: ${locationUrl}`;
      
      // Log the message we would send
      console.log('Sending SMS to:', selectedContacts.map(c => c.phone));
      console.log('Message:', message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Location sent to ${selectedContacts.length} contacts via SMS`);
      navigate('/home');
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Failed to send location');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center bg-card border-b border-border z-10">
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
      <div className="flex-1 relative">
        <MapView 
          satelliteView={true} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />
        
        {/* Share button */}
        <ShareLinkButton userLocation={userLocation} />
      </div>

      {/* Contacts Selection */}
      <div className="p-4 bg-card border-t border-border z-10">
        <h2 className="text-lg font-semibold mb-3">Send to Emergency Contacts</h2>
        
        <ContactSelector 
          contacts={contacts}
          loading={loading}
          toggleContactSelection={toggleContactSelection}
        />
        
        <LocationShareButton
          onSendLocation={handleSendLocation}
          sending={sending}
          loading={loading}
          contactsCount={contacts.length}
        />
      </div>
    </div>
  );
};

export default ImHerePage;
