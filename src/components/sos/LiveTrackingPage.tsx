
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MapView from '@/components/map/MapView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface LiveLocation {
  lat: number;
  lng: number;
  updatedAt: string;
  userId: string;
}

const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('id');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingId) {
      setError('Invalid tracking link');
      setLoading(false);
      return;
    }

    const fetchTrackingData = async () => {
      try {
        // Fetch the tracking session data using the tracking ID
        const { data: trackingData, error: trackingError } = await supabase
          .from('sos_tracking_sessions')
          .select('*')
          .eq('tracking_id', trackingId)
          .single();

        if (trackingError || !trackingData) {
          throw new Error('Invalid tracking link or session expired');
        }

        // Set initial location from tracking data
        if (trackingData.last_location) {
          setUserLocation(trackingData.last_location);
        }

        // Determine if this is a SOS session (with audio) or just location sharing
        setIsSOSActive(trackingData.is_sos_active);
        if (trackingData.audio_url) {
          setAudioUrl(trackingData.audio_url);
        }

        // Subscribe to real-time location updates
        const channel = supabase
          .channel(`tracking:${trackingId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'sos_tracking_sessions',
              filter: `tracking_id=eq.${trackingId}`,
            },
            (payload) => {
              if (payload.new && payload.new.last_location) {
                setUserLocation(payload.new.last_location);
              }
              if (payload.new && payload.new.audio_url !== audioUrl) {
                setAudioUrl(payload.new.audio_url);
              }
            }
          )
          .subscribe();

        setLoading(false);

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError('Error loading tracking data. The tracking link may be invalid or expired.');
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingId]);

  // Handle audio streaming
  useEffect(() => {
    if (audioUrl && isSOSActive) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error('Could not play emergency audio stream');
      });
      setAudioPlayer(audio);

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl, isSOSActive]);

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading tracking data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error}
          </h1>
          <p className="text-muted-foreground mb-6">
            The tracking link may be invalid or expired.
          </p>
          <Button
            variant="default"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className={`p-4 flex items-center justify-center z-10 ${isSOSActive ? 'bg-red-600' : 'bg-safevox-primary'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="text-white absolute left-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-white">
          {isSOSActive ? 'EMERGENCY - LIVE TRACKING' : 'Location Sharing'}
        </h1>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <MapView
          satelliteView={isSOSActive} 
          showMarker={true}
          initialLocation={userLocation || undefined}
        />

        {/* Emergency Call Button (only for SOS) */}
        {isSOSActive && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <Button
              className="bg-red-600 hover:bg-red-700 px-8 rounded-full shadow-lg"
              onClick={handleEmergencyCall}
            >
              <Phone className="mr-2" />
              Emergency Call
            </Button>
          </div>
        )}

        {/* Audio Stream Status (only for SOS) */}
        {isSOSActive && (
          <div className="absolute top-16 left-0 right-0 flex justify-center z-10">
            <div className={`flex items-center px-4 py-2 rounded-full shadow-lg ${audioUrl ? 'bg-green-600' : 'bg-yellow-600'}`}>
              <span className="flex h-3 w-3 relative mr-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${audioUrl ? 'bg-green-400' : 'bg-yellow-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${audioUrl ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </span>
              <span className="text-white text-sm font-medium">
                {audioUrl ? 'Live Audio Stream Active' : 'Waiting for audio stream...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingPage;
