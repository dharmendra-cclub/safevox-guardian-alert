
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import MapView from '@/components/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import Logo from '@/components/Logo';

const Drive: React.FC = () => {
  const navigate = useNavigate();
  const [volume, setVolume] = useState([70]);
  const [isDriving, setIsDriving] = useState(false);

  const handleSOSPress = () => {
    navigate('/sos-activated');
  };

  const toggleDriving = () => {
    setIsDriving(!isDriving);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-safevox-primary p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="ml-2 text-lg font-semibold text-white">Driving Mode</h1>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white">
            <Search size={20} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView satelliteView={false} showMarker={true} />
        
        {/* Volume Control */}
        <div className="absolute top-4 left-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 flex items-center">
          <Volume2 className="mr-3" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
        
        {/* Drive Status */}
        <div className="absolute bottom-20 left-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3">
          <p className="text-center text-sm mb-2">
            {isDriving 
              ? 'Driving mode active. Accident detection enabled.' 
              : 'Start driving to enable accident detection.'}
          </p>
          <Button 
            className={`w-full ${isDriving ? 'bg-orange-500 hover:bg-orange-600' : 'bg-safevox-primary hover:bg-safevox-primary/90'}`}
            onClick={toggleDriving}
          >
            {isDriving ? 'Stop Driving' : 'Start Driving'}
          </Button>
        </div>
        
        {/* SOS Button */}
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Drive;
