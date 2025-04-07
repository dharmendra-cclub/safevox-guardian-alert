
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Mic, 
  Settings, 
  History, 
  Users, 
  Headphones, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

interface SideBarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideBarMenu: React.FC<SideBarMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      path: '/profile',
    },
    {
      icon: Mic,
      label: 'Voice Activation',
      path: '/voice-activation',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
    {
      icon: History,
      label: 'History',
      path: '/history',
    },
    {
      icon: Users,
      label: 'Add Emergency Contacts',
      path: '/emergency-contacts',
    },
    {
      icon: Headphones,
      label: 'Recordings',
      path: '/recordings',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      path: '/help',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background z-30 transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border">
          <Logo />
        </div>
        
        <div className="py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "sidebar-item",
                  isActive && "active"
                )}
                onClick={onClose}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            className="sidebar-item w-full text-left text-destructive"
            onClick={() => {
              // Handle logout
              onClose();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBarMenu;
