
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
        <img 
          src="/lovable-uploads/e8e04187-1bf3-4ed7-b3b4-1dec5f64436c.png" 
          alt="SafeVox Logo" 
          className={cn(sizeClasses[size])}
        />
      </div>
      {showText && (
        <span className="ml-2 text-lg font-bold">SafeVox</span>
      )}
    </div>
  );
};

export default Logo;
