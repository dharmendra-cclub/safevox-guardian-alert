
import React from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Home, User, Bell, Timer, MapPin, Phone, Mic, Settings, HelpCircle, LogOut, Car, Headphones, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SideBarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideBarMenu: React.FC<SideBarMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = React.useState<{
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  
  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
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
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-[85vw] max-w-sm">
        <div className="bg-primary-foreground bg-[#000000] p-4">
          <SheetHeader className="text-left pb-4">
            <Avatar className="h-16 w-16 border-2 border-white mb-2">
              <AvatarImage src={userProfile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="bg-primary text-white text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-white">{userProfile?.full_name || 'User'}</h2>
              <p className="text-sm text-gray-300 truncate max-w-[calc(85vw-4rem)]">{user?.email}</p>
            </div>
          </SheetHeader>
        </div>
        
        <ScrollArea className="h-[calc(100vh-9.5rem)] py-2">
          <div className="space-y-1 px-2">
            {/* User section */}
            <div className="py-2">
              <Button
                variant="ghost"
                className="sidebar-item w-full justify-start"
                onClick={() => handleNavigate('/profile')}
              >
                <User size={20} />
                <span>View Profile</span>
              </Button>
            </div>
            
            <div className="px-3 py-2">
              <h3 className="mb-2 px-1 text-sm font-semibold">Safety Features</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/home')}
                >
                  <Home size={20} />
                  <span>Home</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/emergency-contacts')}
                >
                  <Phone size={20} />
                  <span>Emergency Contacts</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/voice-activation')}
                >
                  <Mic size={20} />
                  <span>Voice Activation</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/drive')}
                >
                  <Car size={20} />
                  <span>Drive</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/recordings')}
                >
                  <Headphones size={20} />
                  <span>Recordings</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/history')}
                >
                  <Clock size={20} />
                  <span>SOS History</span>
                </Button>
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h3 className="mb-2 px-1 text-sm font-semibold">Location Sharing</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/im-here')}
                >
                  <MapPin size={20} />
                  <span>I'm Here</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/timer')}
                >
                  <Timer size={20} />
                  <span>Timer</span>
                </Button>
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h3 className="mb-2 px-1 text-sm font-semibold">Settings</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/settings')}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="sidebar-item w-full justify-start"
                  onClick={() => handleNavigate('/help')}
                >
                  <HelpCircle size={20} />
                  <span>Help & Support</span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="sidebar-item w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideBarMenu;
