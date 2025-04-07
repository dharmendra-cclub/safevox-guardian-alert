
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <svg 
          className={cn(sizeClasses[size], 'text-safevox-primary')} 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 12L12 22L22 12L12 2Z" 
            fill="currentColor" 
            stroke="white" 
            strokeWidth="2"
          />
          <circle 
            cx="12" 
            cy="12" 
            r="4" 
            fill="white" 
          />
        </svg>
      </div>
      {showText && (
        <span className="ml-2 text-lg font-bold">SafeVox</span>
      )}
    </div>
  );
};

export default Logo;
