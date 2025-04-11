
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/map/MapView';
import BottomNavBar from '@/components/BottomNavBar';
import LocationShareButton from './components/LocationShareButton';
import ShareLinkButton from './components/ShareLinkButton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { contactsService } from '@/services/sos';
import { Contact } from './types';
import SOSButton from '@/components/SOSButton';
import { sosService } from '@/services/sos';
import { DrawerContent, DrawerTrigger, Drawer } from '@/components/ui/drawer';

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
        
        {/* Action Buttons */}
        <div className="absolute bottom-24 left-4 right-4 space-y-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
              >
                <Send className="mr-2 h-4 w-4" />
                Send My Location via SMS
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-4">
              <div className="mx-auto w-full max-w-sm">
                <div className="p-4 pb-2">
                  <h3 className="text-lg font-semibold">Select contacts</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose who to share your location with
                  </p>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto mt-2">
                  {contacts.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">No contacts found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/emergency-contacts')}
                      >
                        Add Contacts
                      </Button>
                    </div>
                  ) : (
                    contacts.map(contact => (
                      <div 
                        key={contact.id}
                        className={`p-3 border-b flex justify-between items-center ${
                          contact.selected ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border ${
                          contact.selected ? 'bg-primary border-primary' : 'border-gray-400'
                        }`}>
                          {contact.selected && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    disabled={!contacts.some(c => c.selected) || sending}
                    onClick={handleSendLocation}
                  >
                    {sending ? 'Sending...' : 'Send Location'}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          
          <ShareLinkButton userLocation={userLocation} />
        </div>
        
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default ImHerePage;
