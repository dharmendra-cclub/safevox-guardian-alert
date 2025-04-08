
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import SideBarMenu from '@/components/SideBarMenu';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/SOSService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { voiceRecognitionService } from '@/services/VoiceRecognitionService';
import { supabase } from '@/integrations/supabase/client';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('');

  // Set user ID for services and get location
  useEffect(() => {
    if (user) {
      sosService.setUserId(user.id);
      voiceRecognitionService.setUserId(user.id);
      fetchUserProfile();
      
      // Start voice recognition
      voiceRecognitionService.startListening();
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
    
    // Cleanup function
    return () => {
      voiceRecognitionService.stopListening();
    };
  }, [user]);
  
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setAvatarUrl(data.avatar_url);
        
        // Set initials as fallback
        if (data.full_name) {
          const initials = data.full_name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
          
          setUserInitials(initials);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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
      <div className="bg-[#000000] p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="text-white"
        >
          <Menu size={20} />
        </Button>
        
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>
        
        <Avatar 
          className="h-9 w-9 border-2 border-white cursor-pointer"
          onClick={handleProfileClick}
        >
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-primary text-white">
              {userInitials || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          satelliteView={true} 
          showMarker={true} 
          initialLocation={userLocation || undefined}
        />
        
        {/* SOS Button */}
        <SOSButton onClick={handleSOSPress} className="bottom-8 z-50" />
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
