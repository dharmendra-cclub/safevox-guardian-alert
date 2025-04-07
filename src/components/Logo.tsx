
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
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2L6 12l6 10 6-10-6-10zm0 3.5L15.5 12 12 17.5 8.5 12 12 5.5z" />
          <path d="M12 12.5c.7 0 1.3-.6 1.3-1.3S12.7 10 12 10s-1.3.6-1.3 1.3.6 1.2 1.3 1.2z" />
        </svg>
      </div>
      {showText && (
        <span className="ml-2 text-lg font-bold">SafeVox</span>
      )}
    </div>
  );
};

export default Logo;
