
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SOSButtonProps {
  onClick: () => void;
  className?: string;
  isActive?: boolean;
  hide?: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  onClick, 
  className,
  isActive = false,
  hide = false
}) => {
  const isMobile = useIsMobile();
  
  if (hide) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'sos-button fixed left-1/2 transform -translate-x-1/2 z-20',
        'h-20 w-20 rounded-full flex items-center justify-center',
        'bg-[#222222] border-4 border-[#FFFFFF] shadow-lg',
        'bottom-16 -mb-10', // Position it so half is inside the bottom nav
        isActive && 'animate-pulse',
        className
      )}
      aria-label="SOS Emergency Button"
    >
      <span className="text-[#934B49] font-bold text-xl">SOS</span>
    </button>
  );
};

export default SOSButton;
