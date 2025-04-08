
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, Clock, Settings, HelpCircle, History, AlertTriangle, UserCog, Car, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SideBarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideBarMenu: React.FC<SideBarMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-[300px]">
        {/* User Profile */}
        <div className="p-6 bg-primary/10">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || 'User'} />
              <AvatarFallback className="text-lg">
                {user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user?.user_metadata?.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleNavigation('/profile')}
          >
            View Profile
          </Button>
        </div>
        
        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <a 
            className={`sidebar-item ${isActive('/home') ? 'active' : ''}`}
            onClick={() => handleNavigation('/home')}
          >
            <User size={20} />
            <span>Home</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/emergency-contacts') ? 'active' : ''}`}
            onClick={() => handleNavigation('/emergency-contacts')}
          >
            <Bell size={20} />
            <span>Emergency Contacts</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/timer') ? 'active' : ''}`}
            onClick={() => handleNavigation('/timer')}
          >
            <Clock size={20} />
            <span>Timer</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/drive') ? 'active' : ''}`}
            onClick={() => handleNavigation('/drive')}
          >
            <Car size={20} />
            <span>Drive Mode</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/voice-activation') ? 'active' : ''}`}
            onClick={() => handleNavigation('/voice-activation')}
          >
            <AlertTriangle size={20} />
            <span>Voice Activation</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/recordings') ? 'active' : ''}`}
            onClick={() => handleNavigation('/recordings')}
          >
            <Bell size={20} />
            <span>Recordings</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/history') ? 'active' : ''}`}
            onClick={() => handleNavigation('/history')}
          >
            <History size={20} />
            <span>SOS History</span>
          </a>
        </div>
        
        <div className="border-t border-border mt-2 pt-2 p-4 space-y-1">
          <a 
            className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => handleNavigation('/settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </a>
          
          <a 
            className={`sidebar-item ${isActive('/help') ? 'active' : ''}`}
            onClick={() => handleNavigation('/help')}
          >
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </a>
          
          <a 
            className="sidebar-item text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideBarMenu;
