
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import MapView from '@/components/map/MapView';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/sos';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

const SOSActivated: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [secondsActive, setSecondsActive] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const isMobile = useIsMobile();
  
  // Set user ID for services
  useEffect(() => {
    if (user) {
      sosService.setUserId(user.id);
      audioRecordingService.setUserId(user.id);
      
      // Start SOS process if not already activated
      if (!sosService.isSOSActivated()) {
        sosService.activate();
      }
      
      // Fetch emergency contacts count
      sosService.fetchEmergencyContacts().then((contacts) => {
        setContactsCount(contacts.length);
      });

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
        }
      );
    }
  }, [user]);
  
  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsActive((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format seconds as mm:ss
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleDeactivate = async () => {
    await sosService.deactivate();
    toast.info('SOS deactivated');
    navigate('/home');
  };
  
  const handleEmergencyCall = (service: string) => {
    const phoneNumbers: Record<string, string> = {
      'Police': '911',
      'Ambulance': '911',
      'Fire': '911',
      'Coast Guard': '911',
      'Mountain Rescue': '911'
    };
    
    const phoneNumber = phoneNumbers[service] || '911';
    
    toast.info(`Calling ${service}...`);
    
    // Use tel: protocol to initiate a call if on a mobile device
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-[#222222]/80 p-3 md:p-4 flex flex-col items-center z-10">
        <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 mb-1 text-[#934B49]" />
        <h1 className="text-lg md:text-xl font-bold text-[#934B49]">SOS Activated!!!</h1>
        <p className="text-xs md:text-sm">
          Alert sent to {contactsCount} emergency contacts ({formatTime(secondsActive)})
        </p>
      </div>
      
      {/* Map View */}
      <div className="flex-1 relative">
        <MapView 
          satelliteView={true} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />
        
        {/* Emergency Services */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm rounded-t-lg p-3 md:p-4 z-10">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Quick call emergency services</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-16 md:h-20"
              onClick={() => handleEmergencyCall('Police')}
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5 mb-1" />
              <span className="text-xs md:text-sm">Police</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-16 md:h-20"
              onClick={() => handleEmergencyCall('Ambulance')}
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5 mb-1" />
              <span className="text-xs md:text-sm">Ambulance</span>
            </Button>
            
            {isMobile ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-16 md:h-20 col-span-2 md:col-span-1"
                  >
                    <Phone className="h-4 w-4 md:h-5 md:w-5 mb-1" />
                    <span className="text-xs md:text-sm">Others</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="center">
                  <div className="grid gap-2">
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => handleEmergencyCall('Fire')}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Fire Department</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => handleEmergencyCall('Coast Guard')}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Coast Guard</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => handleEmergencyCall('Mountain Rescue')}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Mountain Rescue</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 md:h-20"
                onClick={() => handleEmergencyCall('Fire')}
              >
                <Phone className="h-5 w-5 mb-1" />
                <span>Fire Dept</span>
              </Button>
            )}
          </div>
          
          <Button
            className="w-full bg-green-500 hover:bg-green-600 py-2 md:py-3"
            onClick={handleDeactivate}
          >
            Deactivate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SOSActivated;
