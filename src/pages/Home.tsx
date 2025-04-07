
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import SOSButton from '@/components/SOSButton';
import BottomNavBar from '@/components/BottomNavBar';
import SideBarMenu from '@/components/SideBarMenu';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { sosService } from '@/services/SOSService';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');

  // Set user ID for SOS service
  useEffect(() => {
    if (user) {
      sosService.setUserId(user.id);
    }
  }, [user]);

  const handleSOSPress = () => {
    sosService.activate();
    toast.success('SOS activated!');
    navigate('/sos-activated');
  };

  const searchAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressQuery.trim()) {
      toast.info(`Searching for: ${addressQuery}`);
      // In a real app, this would call a geocoding API
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-card p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="mr-2"
          >
            <Menu size={20} />
          </Button>
          <Logo />
        </div>
        
        <form onSubmit={searchAddress} className="flex-1 max-w-xs mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search here..."
              className="pl-8 bg-input text-foreground"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center"
          >
            English <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
              >
                <LogOut size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView satelliteView={true} showMarker={true} />
        
        {/* Quick Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-card/80 backdrop-blur-sm text-foreground h-10 w-10 rounded-full"
          >
            <Search size={18} />
          </Button>
        </div>
        
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
