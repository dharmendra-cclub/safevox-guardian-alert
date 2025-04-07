
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MicIcon, BellIcon, MapIcon, UsersIcon } from 'lucide-react';

const GetStarted: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MicIcon,
      title: 'Voice Activation',
      description: 'Set up voice commands to activate SOS in emergencies'
    },
    {
      icon: MapIcon,
      title: 'Real-Time Location',
      description: 'Share your location with emergency contacts'
    },
    {
      icon: BellIcon,
      title: 'Instant Alerts',
      description: 'Notify emergency contacts with one tap'
    },
    {
      icon: UsersIcon,
      title: 'Emergency Contacts',
      description: 'Add trusted people who can help in emergencies'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Welcome to SafeVox</h1>
        <p className="text-muted-foreground text-center mb-8">
          Your personal safety companion that's always ready when you need it.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <feature.icon className="text-safevox-primary mb-2" size={24} />
                <CardTitle className="text-sm">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className="text-xs">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button 
            className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button 
            className="w-full"
            variant="outline" 
            onClick={() => navigate('/signup')}
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
