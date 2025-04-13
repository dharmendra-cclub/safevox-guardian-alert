
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Mic, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SOSHistoryItem {
  id: string;
  timestamp: string;
  codeword?: string;
  location: { lat: number; lng: number };
  audioUrl?: string;
  contactCount: number;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch history from database
    // For now, we'll use mock data
    const mockHistory: SOSHistoryItem[] = [
      {
        id: '1',
        timestamp: '2025-04-08T14:30:00Z',
        codeword: 'Help me now',
        location: { lat: 17.3850, lng: 78.4867 },
        audioUrl: 'https://safevox.io/recordings/sample1.mp3',
        contactCount: 3
      },
      {
        id: '2',
        timestamp: '2025-04-05T18:15:00Z',
        location: { lat: 17.3880, lng: 78.4850 },
        audioUrl: 'https://safevox.io/recordings/sample2.mp3',
        contactCount: 2
      },
      {
        id: '3',
        timestamp: '2025-04-01T09:45:00Z',
        codeword: 'Emergency',
        location: { lat: 17.3820, lng: 78.4890 },
        audioUrl: 'https://safevox.io/recordings/sample3.mp3',
        contactCount: 1
      }
    ];
    
    setHistory(mockHistory);
    setLoading(false);
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  const openLocationLink = (location: { lat: number; lng: number }) => {
    const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };
  
  const playAudio = (url?: string) => {
    if (!url) {
      toast.error('Audio recording not available');
      return;
    }
    
    // In a real app, this would play or download the audio
    console.log('Playing audio:', url);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-card border-b border-border">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">SOS History</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No SOS history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatDate(item.timestamp)}</span>
                  </div>
                  {item.codeword && (
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                      {item.codeword}
                    </div>
                  )}
                </div>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => openLocationLink(item.location)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>View Location</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => playAudio(item.audioUrl)}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    <span>Play Recording</span>
                  </Button>
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Alerted {item.contactCount} emergency contacts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
