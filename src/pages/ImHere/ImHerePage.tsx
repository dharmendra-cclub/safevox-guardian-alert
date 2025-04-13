
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MapView from '@/components/map/MapView';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/sos';
import { locationService } from '@/services/sos';
import { Contact } from './types';
import ContactSelector from './components/ContactSelector';
import LocationShareButton from './components/LocationShareButton';
import ShareLinkButton from './components/ShareLinkButton';

const ImHerePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Function to fetch user location
  const fetchUserLocation = async () => {
    try {
      // First try to get cached location from the service
      let location = locationService.getLocation();
      
      // If no cached location, actively request it
      if (!location) {
        location = await locationService.getCurrentLocation();
      }
      
      if (location) {
        setUserLocation(location);
      } else {
        toast.error("Could not get your location. Please check permissions.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Could not get your location. Please check permissions.");
    }
  };
  
  useEffect(() => {
    if (user) {
      sosService.setUserId(user.id);
      fetchContacts();
    }
    
    // Fetch location on component mount
    fetchUserLocation();
    
    // Add an event listener for when the page becomes visible again
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
  
  // Handle visibility change to update location when user returns to the tab/app
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchUserLocation();
    }
  };
  
  const fetchContacts = async () => {
    setLoading(true);
    const data = await sosService.fetchEmergencyContacts();
    // Convert EmergencyContact[] to Contact[] with selected property
    setContacts(
      data.map(contact => ({
        ...contact,
        selected: true
      }))
    );
    setLoading(false);
  };
  
  const toggleContactSelection = (id: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === id 
          ? { ...contact, selected: !contact.selected } 
          : contact
      )
    );
  };
  
  const getSelectedContactIds = () => {
    return contacts
      .filter(contact => contact.selected)
      .map(contact => contact.id);
  };
  
  const handleSendLocation = async () => {
    // Re-fetch location just before sending to ensure we have the latest
    await fetchUserLocation();
    
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }
    
    setSending(true);
    try {
      const selectedContactIds = getSelectedContactIds();
      
      if (selectedContactIds.length === 0) {
        toast.warning('No contacts selected');
        setSending(false);
        return;
      }
      
      const customMessage = `I'm currently at this location.`;
      
      await sosService.activate(customMessage, selectedContactIds);
      toast.success('Location sent successfully!');
    } catch (error) {
      console.error('Error sharing location:', error);
      toast.error('Failed to send location');
    } finally {
      setSending(false);
    }
  };
  
  const getSelectedContactsCount = () => {
    return contacts.filter(contact => contact.selected).length;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
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
        
        <ShareLinkButton userLocation={userLocation} />
        
        {/* Bottom Panel */}
        <Card className="absolute bottom-0 left-0 right-0 rounded-t-xl z-10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Share My Location</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="sms" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sms" className="space-y-4">
                <ContactSelector 
                  contacts={contacts}
                  loading={loading}
                  toggleContactSelection={toggleContactSelection}
                />
                
                <LocationShareButton 
                  onSendLocation={handleSendLocation}
                  sending={sending}
                  loading={loading}
                  contactsCount={getSelectedContactsCount()}
                />
              </TabsContent>
              
              <TabsContent value="social">
                <div className="grid grid-cols-3 gap-3 py-4">
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <span className="text-2xl mb-1">📱</span>
                    <span>WhatsApp</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <span className="text-2xl mb-1">💬</span>
                    <span>Messenger</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <span className="text-2xl mb-1">📧</span>
                    <span>Email</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImHerePage;
