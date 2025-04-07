
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Page not found</p>
        <Button 
          onClick={() => navigate('/home')}
          className="flex items-center bg-safevox-primary hover:bg-safevox-primary/90"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
