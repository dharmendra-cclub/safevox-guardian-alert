
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/map/MapView';
import BottomNavBar from '@/components/BottomNavBar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { contactsService } from '@/services/sos';
import { Contact } from './types';
import SOSButton from '@/components/SOSButton';
import { sosService } from '@/services/sos';
import ShareLinkButton from './components/ShareLinkButton';
import LocationShareButton from './components/LocationShareButton';

const ImHerePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (user) {
      contactsService.setUserId(user.id);
      fetchContacts();
      
      // Get user location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Please check permissions.");
        }
      );
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const fetchedContacts = await contactsService.fetchEmergencyContacts();
      const contactsWithSelectionState = fetchedContacts.map(contact => ({
        ...contact,
        selected: false
      }));
      setContacts(contactsWithSelectionState);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (id: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === id ? { ...contact, selected: !contact.selected } : contact
      )
    );
  };

  const handleSendLocation = async () => {
    if (!userLocation) {
      toast.error('Unable to get your location');
      return;
    }
    
    const selectedContacts = contacts.filter(contact => contact.selected);
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    setSending(true);
    
    try {
      const selectedContactIds = selectedContacts.map(contact => contact.id);
      
      await sosService.activate(
        "I'm here! This is my current location.", 
        selectedContactIds
      );
      
      toast.success(`Location sent to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`);
      
      // Reset selection
      setContacts(prevContacts => 
        prevContacts.map(contact => ({ ...contact, selected: false }))
      );
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Failed to send location');
    } finally {
      setSending(false);
    }
  };

  const handleSOSPress = () => {
    sosService.activate();
    toast.success('SOS activated!');
    navigate('/sos-activated');
  };

  const handleShareLink = () => {
    if (!userLocation) {
      toast.error("Unable to get your current location");
      return;
    }

    // Create a shareable link with the location
    const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    
    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Location',
        text: 'Here is my current location',
        url: locationUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(locationUrl);
        toast.success('Location link copied to clipboard');
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-safevox-primary p-4 flex items-center justify-center z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white absolute left-2"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-white">I'm Here</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          satelliteView={false} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />
        
        {/* Action Buttons */}
        <div className="absolute bottom-24 left-4 right-4 space-y-2">
          <LocationShareButton 
            onSendLocation={handleSendLocation} 
            sending={sending} 
            loading={loading}
            contactsCount={contacts.filter(c => c.selected).length}
          />
          
          <Button
            className="w-full bg-secondary hover:bg-secondary/90"
            onClick={handleShareLink}
          >
            Share Location Link
          </Button>
        </div>
        
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default ImHerePage;
