
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Mic, 
  Users, 
  ExternalLink, 
  MessageSquare,
  Bell,
  Car
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { historyService } from '@/services/sos/HistoryService';
import { SOSHistoryEntry, EmergencyContact } from '@/services/sos/types';
import { contactsService } from '@/services/sos/ContactsService';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Record<string, EmergencyContact>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Set user ID for services
        historyService.setUserId(user.id);
        contactsService.setUserId(user.id);
        
        // Load contact info for displaying names
        const contactsList = await contactsService.fetchEmergencyContacts();
        const contactsMap: Record<string, EmergencyContact> = {};
        contactsList.forEach(contact => {
          contactsMap[contact.id] = contact;
        });
        setContacts(contactsMap);
        
        // Load SOS history
        const historyData = await historyService.getSOSHistory();
        setHistory(historyData);
      } catch (error) {
        console.error('Error loading history data:', error);
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const getTriggerTypeIcon = (type?: string) => {
    switch (type) {
      case 'button':
        return <Bell size={16} className="mr-2 text-red-500" />;
      case 'codeword':
        return <MessageSquare size={16} className="mr-2 text-blue-500" />;
      case 'crash':
        return <Car size={16} className="mr-2 text-yellow-500" />;
      case 'timer':
        return <Clock size={16} className="mr-2 text-purple-500" />;
      default:
        return <Bell size={16} className="mr-2 text-muted-foreground" />;
    }
  };

  const getTriggerTypeLabel = (type?: string) => {
    switch (type) {
      case 'button':
        return 'SOS Button';
      case 'codeword':
        return 'Voice Codeword';
      case 'crash':
        return 'Crash Detection';
      case 'timer':
        return 'Safety Timer';
      default:
        return 'SOS Alert';
    }
  };

  const getContactNames = (contactIds: string[]) => {
    return contactIds.map(id => 
      contacts[id]?.name || 'Unknown Contact'
    );
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Separator className="my-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-4 w-3/4 mt-3" />
              </div>
            ))}
          </div>
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
                  <Badge variant="outline" className="flex items-center">
                    {getTriggerTypeIcon(item.triggerType)}
                    {getTriggerTypeLabel(item.triggerType)}
                  </Badge>
                </div>
                
                {item.codewordUsed && (
                  <div className="mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                    Codeword: "{item.codewordUsed}"
                  </div>
                )}
                
                <Separator className="my-3" />
                
                <div className="text-sm mb-3">
                  <MessageSquare size={16} className="inline mr-2 text-muted-foreground" />
                  <span className="text-foreground">{item.message}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {item.location && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => openLocationLink(item.location!)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>View Location</span>
                    </Button>
                  )}
                  
                  {item.audioUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => playAudio(item.audioUrl)}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      <span>Play Recording</span>
                    </Button>
                  )}
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 inline mr-2" />
                  <span>Alerted {item.contactIds.length} emergency contacts</span>
                  <div className="ml-6 mt-1 text-xs">
                    {getContactNames(item.contactIds).map((name, index) => (
                      <span key={index} className="mr-1">{name}{index < item.contactIds.length - 1 ? ',' : ''}</span>
                    ))}
                  </div>
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
