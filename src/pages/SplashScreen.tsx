
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  // Check for user authentication and permissions on mount
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const user = localStorage.getItem('user');
    // Check if permissions were already granted
    const permissionsGranted = localStorage.getItem('permissionsGranted');

    if (user && permissionsGranted === 'true') {
      // If both user and permissions are available, go directly to home
      navigate('/home');
    } else if (user && !permissionsGranted) {
      // If user exists but permissions not granted, go to permissions page
      navigate('/permissions');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        <Logo size="lg" showText={false} />
        
        <h1 className="text-2xl font-bold mt-4">SafeVox</h1>
        <p className="text-muted-foreground text-center mb-8">Your Safety, Your Voice</p>
        
        <Button 
          className="w-full bg-safevox-primary hover:bg-safevox-primary/90 text-white font-medium py-6"
          onClick={() => navigate('/get-started')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default SplashScreen;
