
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
    >
      SOS
    </button>
  );
};

export default SOSButton;
