
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Car, MapPin, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
    },
    {
      icon: Car,
      label: 'Drive',
      path: '/drive',
    },
    {
      icon: MapPin,
      label: "I'm Here",
      path: '/im-here',
    },
    {
      icon: Timer,
      label: 'Timer',
      path: '/timer',
    },
  ];

  return (
    <div className="bottom-bar">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={cn(
              "flex flex-col items-center justify-center", 
              isActive ? "active-nav-item" : "inactive-nav-item"
            )}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
