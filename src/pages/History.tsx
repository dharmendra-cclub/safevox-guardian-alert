import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Clock, MapPin, Mic, Users, 
  ExternalLink, AlertTriangle, Phone, 
  Timer as TimerIcon, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { historyService } from '@/services/sos';
import { SOSHistoryEntry } from '@/services/sos/types';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      historyService.setUserId(user.id);
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const historyData = await historyService.getSOSHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  const openLocationLink = (location: { lat: number; lng: number } | null) => {
    if (!location) {
      toast.error('Location data not available');
      return;
    }
    
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

  const getTriggerTypeLabel = (type?: string) => {
    switch (type) {
      case 'button':
        return { label: 'SOS Button', icon: <AlertTriangle className="h-4 w-4 mr-1" />, color: 'bg-destructive/10 text-destructive' };
      case 'codeword':
        return { label: 'Codeword', icon: <MessageSquare className="h-4 w-4 mr-1" />, color: 'bg-blue-500/10 text-blue-500' };
      case 'crash':
        return { label: 'Crash Detected', icon: <AlertTriangle className="h-4 w-4 mr-1" />, color: 'bg-orange-500/10 text-orange-500' };
      case 'timer':
        return { label: 'Timer', icon: <TimerIcon className="h-4 w-4 mr-1" />, color: 'bg-purple-500/10 text-purple-500' };
      default:
        return { label: 'Unknown', icon: <AlertTriangle className="h-4 w-4 mr-1" />, color: 'bg-gray-500/10 text-gray-500' };
    }
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
      <div className="flex-1 p-4 md:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-4 w-48 mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No SOS history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="w-full">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{formatDate(item.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.triggerType && (
                        <Badge variant="outline" className={`flex items-center ${getTriggerTypeLabel(item.triggerType).color}`}>
                          {getTriggerTypeLabel(item.triggerType).icon}
                          {getTriggerTypeLabel(item.triggerType).label}
                        </Badge>
                      )}
                      {item.codewordUsed && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          "{item.codewordUsed}"
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {item.message && (
                    <div className="mt-2 text-sm bg-secondary/40 p-2 rounded-md">
                      <p className="italic">"{item.message}"</p>
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => openLocationLink(item.location)}
                      disabled={!item.location}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{item.location ? 'View Location' : 'No Location Data'}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => playAudio(item.audioUrl)}
                      disabled={!item.audioUrl}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      <span>Play Recording</span>
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Alerted {item.contactIds.length} emergency contacts</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
