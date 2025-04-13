
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import MapView from '@/components/map/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import { sosService } from '@/services/sos';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Drive: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [volume, setVolume] = useState([70]);
  const [isDriving, setIsDriving] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Auto-enable driving mode and get location
  useEffect(() => {
    // Set driving mode to true when component mounts
    setIsDriving(true);
    toast.success('Driving mode activated');
    
    // Start "accident detection" simulation
    startAccidentDetection();

    // Register navigation callback
    sosService.registerNavigateCallback(navigate);

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

    return () => {
      // Clear any timers or listeners when component unmounts
      stopAccidentDetection();
    };
  }, [navigate]);

  const startAccidentDetection = () => {
    console.log('Started accident detection simulation');
    // In a real app, this would use the device's accelerometer and gyroscope
    // to detect sudden changes in acceleration that might indicate an accident
  };

  const stopAccidentDetection = () => {
    console.log('Stopped accident detection simulation');
  };

  const handleSOSPress = () => {
    sosService.activate(undefined, undefined, 'button');
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

  const simulateAccident = () => {
    sosService.simulateAccident();
    navigate('/sos-activated');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-safevox-primary p-4 flex items-center justify-center z-10">
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
        
        {/* Drive Status - Moved up significantly to prevent overlap with SOS button */}
        <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 bg-card/80 backdrop-blur-sm p-3 z-10">
          <p className="text-center text-sm mb-2">
            {isDriving 
              ? 'Driving mode active. Accident detection enabled.' 
              : 'Start driving to enable accident detection.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className={`w-full ${isDriving ? 'bg-orange-500 hover:bg-orange-600' : 'bg-safevox-primary hover:bg-safevox-primary/90'}`}
              onClick={toggleDriving}
            >
              {isDriving ? 'Exit Driving Mode' : 'Start Driving'}
            </Button>
            
            {isDriving && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={simulateAccident}
              >
                Simulate Accident
              </Button>
            )}
          </div>
        </div>
        
        {/* SOS Button */}
        <SOSButton onClick={handleSOSPress} className="bottom-8 z-50" />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Drive;
