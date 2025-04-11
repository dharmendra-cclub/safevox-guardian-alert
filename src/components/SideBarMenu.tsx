
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Home, AlertCircle, User, Bell, MessageCircle, Settings, 
  HelpCircle, TimerOff, Phone, Clock, LogOut
} from 'lucide-react';

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const SideBarMenu: React.FC<SideBarProps> = ({ isOpen, onClose, onOpenChange }) => {
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>('');
  const [fullName, setFullName] = useState<string>('User');

  useEffect(() => {
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
        setAvatarUrl(data.avatar_url);
        
        if (data.full_name) {
          setFullName(data.full_name);
          
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

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-background p-0 w-[250px]" onInteractOutside={onClose}>
        <ScrollArea className="h-full">
          <div className="flex flex-col p-4 space-y-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="h-12 w-12 border-2 border-primary">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {userInitials || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              <Link to="/home" className="sidebar-item" onClick={onClose}>
                <Home size={18} />
                <span>Home</span>
              </Link>
              
              <Link to="/emergency-contacts" className="sidebar-item" onClick={onClose}>
                <Phone size={18} />
                <span>Emergency Contacts</span>
              </Link>
              
              <Link to="/history" className="sidebar-item" onClick={onClose}>
                <Clock size={18} />
                <span>SOS History</span>
              </Link>

              <Link to="/voice-activation" className="sidebar-item" onClick={onClose}>
                <MessageCircle size={18} />
                <span>Voice Codewords</span>
              </Link>
              
              <Link to="/timer" className="sidebar-item" onClick={onClose}>
                <TimerOff size={18} />
                <span>Safety Timer</span>
              </Link>

              <Link to="/profile" className="sidebar-item" onClick={onClose}>
                <User size={18} />
                <span>My Profile</span>
              </Link>

              <Link to="/settings" className="sidebar-item" onClick={onClose}>
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              
              <Link to="/help" className="sidebar-item" onClick={onClose}>
                <HelpCircle size={18} />
                <span>Help & Support</span>
              </Link>
            </nav>

            <div className="mt-auto pt-4 border-t border-border">
              <button 
                className="sidebar-item w-full text-left text-destructive" 
                onClick={handleSignOut}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SideBarMenu;
