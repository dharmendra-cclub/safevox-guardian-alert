
import React from 'react';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onClick: () => void;
  className?: string;
  isActive?: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  onClick, 
  className,
  isActive = false
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'sos-button',
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
