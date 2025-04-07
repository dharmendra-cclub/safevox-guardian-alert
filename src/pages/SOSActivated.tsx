
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/SOSService';
import { audioRecordingService } from '@/services/AudioRecordingService';

const SOSActivated: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [secondsActive, setSecondsActive] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  
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
      'Others': '911'
    };
    
    const phoneNumber = phoneNumbers[service] || '911';
    
    toast.info(`Calling ${service}...`);
    
    // Use tel: protocol to initiate a call if on a mobile device
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-safevox-sos p-4 flex flex-col items-center">
        <AlertTriangle className="h-8 w-8 mb-1" />
        <h1 className="text-xl font-bold">SOS Activated!!!</h1>
        <p className="text-sm">
          Alert sent to {contactsCount} emergency contacts ({formatTime(secondsActive)})
        </p>
      </div>
      
      {/* Map View */}
      <div className="flex-1 relative">
        <MapView satelliteView={true} showMarker={true} />
        
        {/* Emergency Services */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Quick call emergency services</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleEmergencyCall('Police')}
            >
              <Phone className="h-5 w-5 mb-1" />
              <span>Police</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleEmergencyCall('Ambulance')}
            >
              <Phone className="h-5 w-5 mb-1" />
              <span>Ambulance</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleEmergencyCall('Others')}
            >
              <Phone className="h-5 w-5 mb-1" />
              <span>Others</span>
            </Button>
          </div>
          
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
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
