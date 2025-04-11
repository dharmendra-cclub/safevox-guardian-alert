import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/map/MapView';
import BottomNavBar from '@/components/BottomNavBar';
import ContactSelector from './components/ContactSelector';
import LocationShareButton from './components/LocationShareButton';
import ShareLinkButton from './components/ShareLinkButton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { contactsService } from '@/services/sos';
import { Contact } from './types';
import SOSButton from '@/components/SOSButton';
import { sosService } from '@/services/sos';

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
        
        {/* Contact Selector */}
        <div className="absolute top-4 left-4 right-4">
          <ContactSelector 
            contacts={contacts} 
            loading={loading} 
            toggleContactSelection={toggleContactSelection} 
          />
        </div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-24 left-4 right-4 space-y-2">
          <LocationShareButton 
            onSendLocation={handleSendLocation} 
            sending={sending} 
            loading={loading}
            contactsCount={contacts.filter(c => c.selected).length}
          />
          
          <ShareLinkButton 
            userLocation={userLocation}
          />
        </div>
        
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default ImHerePage;
