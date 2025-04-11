
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Share2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import MapView from '@/components/map/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import { sosService } from '@/services/sos';
import { contactsService } from '@/services/sos/ContactsService';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const Drive: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [volume, setVolume] = useState([70]);
  const [isDriving, setIsDriving] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; name: string; phone: string; selected: boolean }[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Auto-enable driving mode and get location
  useEffect(() => {
    // Set driving mode to true when component mounts
    setIsDriving(true);
    toast.success('Driving mode activated');
    
    // Start "accident detection" simulation
    startAccidentDetection();

    // Get current location
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

    // Load contacts if the user is logged in
    if (user) {
      sosService.setUserId(user.id);
      loadContacts();
    }

    return () => {
      // Clear any timers or listeners when component unmounts
      stopAccidentDetection();
    };
  }, [user]);

  const loadContacts = async () => {
    try {
      const emergencyContacts = await contactsService.fetchEmergencyContacts();
      setContacts(emergencyContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        selected: false
      })));
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const startAccidentDetection = () => {
    console.log('Started accident detection simulation');
    // In a real app, this would use the device's accelerometer and gyroscope
    // to detect sudden changes in acceleration that might indicate an accident
  };

  const stopAccidentDetection = () => {
    console.log('Stopped accident detection simulation');
  };

  const handleSOSPress = () => {
    sosService.activate();
    navigate('/sos-activated');
  };

  const toggleDriving = () => {
    if (isDriving) {
      setIsDriving(false);
      stopAccidentDetection();
      toast.info('Driving mode deactivated');
    } else {
      setIsDriving(true);
      startAccidentDetection();
      toast.success('Driving mode activated');
    }
  };

  const handleShareLocation = () => {
    setIsContactModalOpen(true);
  };

  const toggleContact = (id: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, selected: !contact.selected } : contact
    ));
  };

  const handleSendLocation = async () => {
    const selectedContacts = contacts.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    setIsSending(true);
    
    try {
      // Generate location URL
      const locationUrl = userLocation 
        ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` 
        : '';
      
      // Create message text
      const message = `I'm sharing my current location with you: ${locationUrl}`;
      
      // In a real app, this would send SMS, for now just simulate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log what would happen in a real app
      console.log("Sending location via SMS to:", selectedContacts);
      console.log("Message:", message);
      
      // Add to history
      const contactIds = selectedContacts.map(c => c.id);
      await sosService.addLocationShareToHistory(userLocation, contactIds);
      
      toast.success(`Location sent to ${selectedContacts.length} contacts`);
      setIsContactModalOpen(false);
    } catch (error) {
      console.error("Error sending location:", error);
      toast.error("Failed to send location");
    } finally {
      setIsSending(false);
    }
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
      {/* Top Navigation Bar */}
      <div className="bg-primary p-4 flex items-center justify-center z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white absolute left-2"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-white">Driving Mode</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          satelliteView={false} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />
        
        {/* Volume Control */}
        <div className="absolute top-4 left-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 flex items-center z-10">
          <Volume2 className="mr-3" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
        
        {/* Location Sharing Buttons */}
        <div className="absolute top-20 left-4 right-4 grid grid-cols-2 gap-2 z-10">
          <Button 
            className="bg-primary hover:bg-primary/90 flex items-center justify-center"
            onClick={handleShareLocation}
          >
            <Phone className="mr-2 h-4 w-4" />
            Send My Location via SMS
          </Button>
          
          <Button 
            className="bg-secondary hover:bg-secondary/90 flex items-center justify-center"
            onClick={handleShareLink}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
        
        {/* Drive Status - Move upward to avoid overlap with SOS button */}
        <div className="absolute bottom-32 left-0 right-0 bg-card/80 backdrop-blur-sm p-3 z-10">
          <p className="text-center text-sm mb-2">
            {isDriving 
              ? 'Driving mode active. Accident detection enabled.' 
              : 'Start driving to enable accident detection.'}
          </p>
          <Button 
            className={`w-full ${isDriving ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
            onClick={toggleDriving}
          >
            {isDriving ? 'Exit Driving Mode' : 'Start Driving'}
          </Button>
        </div>
        
        {/* SOS Button */}
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Contact Selection Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Select contacts to share location with</DialogTitle>
          </DialogHeader>
          
          <div className={`${contacts.length > 5 ? 'max-h-60 overflow-y-auto' : ''} py-2`}>
            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No emergency contacts found. Add contacts in the Emergency Contacts section.
              </p>
            ) : (
              contacts.map(contact => (
                <div key={contact.id} className="flex items-center space-x-3 py-2">
                  <Checkbox 
                    checked={contact.selected} 
                    onCheckedChange={() => toggleContact(contact.id)}
                  />
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendLocation} 
              disabled={isSending || contacts.filter(c => c.selected).length === 0}
            >
              {isSending ? "Sending..." : "Send Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Drive;
