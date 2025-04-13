
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Mic, Users, AlertTriangle, Car, Radio } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { historyService } from '@/services/sos/HistoryService';
import { SOSHistoryEntry } from '@/services/sos/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      
      setLoading(true);
      historyService.setUserId(user.id);
      
      try {
        const sosHistory = await historyService.fetchSOSHistory();
        setHistory(sosHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load SOS history');
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
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
  
  const getTriggerIcon = (triggerType?: string) => {
    switch (triggerType) {
      case 'button':
        return <AlertTriangle className="h-4 w-4 text-safevox-sos" />;
      case 'codeword':
        return <Radio className="h-4 w-4 text-primary" />;
      case 'crash':
        return <Car className="h-4 w-4 text-orange-500" />;
      case 'timer':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-safevox-sos" />;
    }
  };
  
  const getTriggerLabel = (triggerType?: string) => {
    switch (triggerType) {
      case 'button':
        return 'SOS Button';
      case 'codeword':
        return 'Voice Codeword';
      case 'crash':
        return 'Crash Detection';
      case 'timer':
        return 'Timer Expired';
      default:
        return 'Manual SOS';
    }
  };
  
  const getTriggerBadgeColor = (triggerType?: string) => {
    switch (triggerType) {
      case 'button':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'codeword':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'crash':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'timer':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
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
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-4 w-40 mt-3" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No SOS history found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your emergency alerts will appear here
            </p>
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
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={getTriggerBadgeColor(item.trigger_type)}
                    >
                      {getTriggerIcon(item.trigger_type)}
                      <span className="ml-1">{getTriggerLabel(item.trigger_type)}</span>
                    </Badge>
                    
                    {item.codeword_used && (
                      <Badge className="bg-primary/10 text-primary">
                        "{item.codeword_used}"
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm my-2 p-2 bg-muted/50 rounded-md">
                  {item.message || "Emergency Alert"}
                </p>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {item.location && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => openLocationLink(item.location)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>View Location</span>
                    </Button>
                  )}
                  
                  {item.audio_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => playAudio(item.audio_url)}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      <span>Play Recording</span>
                    </Button>
                  )}
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    Alerted {item.contact_ids?.length || 0} emergency contacts
                  </span>
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
