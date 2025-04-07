
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import SideBarMenu from '@/components/SideBarMenu';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/SOSService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Set user ID for SOS service and get location
  useEffect(() => {
    if (user) {
      sosService.setUserId(user.id);
    }

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
  }, [user]);

  const handleSOSPress = () => {
    sosService.activate();
    toast.success('SOS activated!');
    navigate('/sos-activated');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-card p-4 flex items-center justify-between border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </Button>
        
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleProfileClick}
        >
          <User size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          satelliteView={true} 
          showMarker={true} 
          initialLocation={userLocation || undefined}
        />
        
        {/* SOS Button */}
        <SOSButton onClick={handleSOSPress} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
      
      {/* Sidebar Menu */}
      <SideBarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default Home;
