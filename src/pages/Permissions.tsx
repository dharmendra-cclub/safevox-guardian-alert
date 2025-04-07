
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const permissions = [
    {
      id: 'location',
      title: 'Location',
      description: 'Required for real-time location tracking',
    },
    {
      id: 'microphone',
      title: 'Microphone',
      description: 'Allow audio recording with your voice',
    },
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'Send emergency duration to your contacts',
    },
    {
      id: 'storage',
      title: 'Storage',
      description: 'Save recordings for your current calls/use',
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Allow alerts for safety features & reminders',
    },
  ];

  const requestPermissions = async () => {
    setLoading(true);

    try {
      // Request location permission
      if ('geolocation' in navigator) {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (error) => {
              console.error('Location permission denied:', error);
              toast.error('Location permission is required for this app to function properly');
              reject(error);
            }
          );
        });
      }

      // Request microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .catch((error) => {
            console.error('Microphone permission denied:', error);
            toast.error('Microphone permission is required for voice activation features');
            throw error;
          });
      }

      // For contacts and storage, we would normally use capacitor or react-native APIs
      // Here we'll just simulate success

      // For notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.error('Notification permission denied');
          toast.error('Notification permission is recommended for alerts');
        }
      }

      toast.success('Permissions granted successfully');
      navigate('/home');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Some permissions were denied. App functionality may be limited.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-muted-foreground mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Before You Start</h1>
        <p className="text-muted-foreground mb-6">
          We need your permission to enable all safety features
        </p>

        <div className="space-y-4 mb-8">
          {permissions.map((permission) => (
            <div 
              key={permission.id}
              className="flex items-center p-4 border border-border rounded-lg bg-card"
            >
              <div className="ml-3">
                <h3 className="font-medium">{permission.title}</h3>
                <p className="text-sm text-muted-foreground">{permission.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={requestPermissions}
          className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
          disabled={loading}
        >
          {loading ? 'Requesting permissions...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default Permissions;
