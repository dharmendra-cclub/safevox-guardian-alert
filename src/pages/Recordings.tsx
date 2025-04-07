import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Trash, 
  MoreVertical 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbRecording = Database['public']['Tables']['recordings']['Row'];

interface Recording extends DbRecording {
  date: string;
  isPlaying?: boolean;
}

const Recordings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const formattedRecordings = data.map(rec => ({
          ...rec,
          date: new Date(rec.created_at || '').toLocaleString(),
          isPlaying: false
        }));
        
        setRecordings(formattedRecordings);
      } catch (error) {
        console.error('Error fetching recordings:', error);
        toast.error('Failed to load recordings');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [user]);

  useEffect(() => {
    const audio = new Audio();
    setAudioElement(audio);
    
    audio.addEventListener('ended', handlePlaybackEnded);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', handlePlaybackEnded);
      }
    };
  }, []);

  const handlePlaybackEnded = () => {
    setRecordings(rec => 
      rec.map(recording => ({
        ...recording,
        isPlaying: false
      }))
    );
    setCurrentPlayingId(null);
  };

  const togglePlayPause = (id: string, url: string) => {
    if (!audioElement) return;
    
    if (currentPlayingId !== id) {
      audioElement.src = url;
      audioElement.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error('Failed to play recording');
      });
      setCurrentPlayingId(id);
      
      setRecordings(rec => 
        rec.map(recording => ({
          ...recording,
          isPlaying: recording.id === id
        }))
      );
    } else {
      if (audioElement.paused) {
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error('Failed to play recording');
        });
        
        setRecordings(rec => 
          rec.map(recording => ({
            ...recording,
            isPlaying: recording.id === id
          }))
        );
      } else {
        audioElement.pause();
        
        setRecordings(rec => 
          rec.map(recording => ({
            ...recording,
            isPlaying: false
          }))
        );
        setCurrentPlayingId(null);
      }
    }
  };

  const deleteRecording = async (id: string) => {
    if (!user) return;
    
    try {
      if (currentPlayingId === id && audioElement) {
        audioElement.pause();
        setCurrentPlayingId(null);
      }
      
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setRecordings(recordings.filter(rec => rec.id !== id));
      toast.success('Recording deleted');
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Recordings</h1>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="text-center py-8">
            Loading recordings...
          </div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recordings available
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div 
                key={recording.id}
                className="p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-medium">{recording.name}</h3>
                    <p className="text-xs text-muted-foreground">{recording.date}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteRecording(recording.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-safevox-primary"
                    onClick={() => togglePlayPause(recording.id, recording.recording_url)}
                  >
                    {recording.isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </Button>
                  <div className="ml-2 flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-safevox-primary transition-all duration-300"
                        style={{ 
                          width: recording.isPlaying ? '45%' : '0%' 
                        }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm">{recording.duration}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recordings;
