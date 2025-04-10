
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Mic, Users, ExternalLink, AlertTriangle, Car, MessageCircle, TimerOff } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { historyService } from '@/services/sos/HistoryService';
import { SOSHistoryEntry } from '@/services/sos/types';
import { contactsService } from '@/services/sos/ContactsService';
import { EmergencyContact } from '@/services/sos/types';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadContacts();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await historyService.getSOSHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsData = await contactsService.fetchEmergencyContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

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

  const getContactNames = (contactIds: string[]) => {
    const names = contactIds.map(id => {
      const contact = contacts.find(c => c.id === id);
      return contact ? contact.name : 'Unknown';
    });
    
    if (names.length === 0) return 'No contacts';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names[0]} and ${names.length - 1} others`;
  };

  const getTriggerIcon = (triggerType?: string) => {
    switch (triggerType) {
      case 'button':
        return <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />;
      case 'codeword':
        return <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />;
      case 'crash':
        return <Car className="h-4 w-4 mr-2 text-orange-500" />;
      case 'timer':
        return <TimerOff className="h-4 w-4 mr-2 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />;
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
        return 'Safety Timer';
      default:
        return 'SOS Button';
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
      <div className="flex-1 p-4 pb-20 sm:pb-4">
        {loading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No SOS history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatDate(item.timestamp)}</span>
                  </div>
                  
                  <Badge 
                    className={`
                      ${item.triggerType === 'button' ? 'bg-red-500/20 text-red-500' : ''}
                      ${item.triggerType === 'codeword' ? 'bg-blue-500/20 text-blue-500' : ''}
                      ${item.triggerType === 'crash' ? 'bg-orange-500/20 text-orange-500' : ''}
                      ${item.triggerType === 'timer' ? 'bg-purple-500/20 text-purple-500' : ''}
                    `}
                  >
                    {getTriggerIcon(item.triggerType)}
                    {getTriggerLabel(item.triggerType)}
                  </Badge>
                </div>
                
                <p className="text-sm mt-2">{item.message}</p>
                
                {item.codewordUsed && (
                  <div className="mt-2 text-sm text-blue-400">
                    <span>Codeword: "{item.codewordUsed}"</span>
                  </div>
                )}
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {item.location && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center justify-center"
                      onClick={() => openLocationLink(item.location as {lat: number, lng: number})}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>View Location</span>
                    </Button>
                  )}
                  
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
                  <span>Alerted {getContactNames(item.contactIds)}</span>
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
