
import React from 'react';
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

interface Recording {
  id: string;
  name: string;
  date: string;
  duration: string;
  isPlaying?: boolean;
}

const Recordings: React.FC = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = React.useState<Recording[]>([
    { id: '1', name: 'Recording 1', date: '2023-07-30 18:23:17', duration: '01:23' },
    { id: '2', name: 'Recording 2', date: '2023-07-28 22:23:17', duration: '02:45' },
    { id: '3', name: 'Recording 3', date: '2023-07-25 12:23:17', duration: '00:58' },
    { id: '4', name: 'Recording 4', date: '2023-07-19 08:23:17', duration: '03:12' },
  ]);

  const togglePlayPause = (id: string) => {
    setRecordings(
      recordings.map((rec) => ({
        ...rec,
        isPlaying: rec.id === id ? !rec.isPlaying : false,
      }))
    );
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter((rec) => rec.id !== id));
    toast.success('Recording deleted');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1">
        {recordings.length === 0 ? (
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
                    onClick={() => togglePlayPause(recording.id)}
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
                        className="h-full bg-safevox-primary"
                        style={{ width: recording.isPlaying ? '45%' : '0%' }}
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
