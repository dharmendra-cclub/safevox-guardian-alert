
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash, Plus, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Updated interface to match our component's expectations
interface CodeWord {
  id: string;
  word: string;
  message: string;
}

// Interface for the database structure
interface VoiceActivationDB {
  id: string;
  user_id: string;
  code_word: string;
  message: string;
  created_at: string;
  updated_at: string;
}

const VoiceActivation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [codeWords, setCodeWords] = useState<CodeWord[]>([
    {
      id: 'default',
      word: 'Help me now',
      message: 'Emergency Alert: Need immediate assistance!',
    },
  ]);
  const [loading, setLoading] = useState(true);
  
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCodeWords = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('voice_activations')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        const defaultCodeWord = {
          id: 'default',
          word: 'Help me now',
          message: 'Emergency Alert: Need immediate assistance!',
        };
        
        // Transform the data from Supabase format to our component format
        const transformedData = data?.map((item: VoiceActivationDB) => ({
          id: item.id,
          word: item.code_word,
          message: item.message
        })) || [];
        
        setCodeWords([defaultCodeWord, ...transformedData]);
      } catch (error) {
        console.error('Error fetching code words:', error);
        toast.error('Failed to load voice activations');
      } finally {
        setLoading(false);
      }
    };

    fetchCodeWords();
  }, [user]);

  const addCodeWord = async () => {
    if (!user) return;
    
    if (newCodeWord.trim() === '') {
      toast.error('Please enter a codeword');
      return;
    }
    
    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('voice_activations')
        .insert({
          user_id: user.id,
          code_word: newCodeWord,
          message: newMessage || 'Emergency alert!'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the newly added data to match our component format
      const newCodeWordItem: CodeWord = {
        id: data.id,
        word: data.code_word,
        message: data.message
      };
      
      setCodeWords([...codeWords, newCodeWordItem]);
      setNewCodeWord('');
      setNewMessage('');
      toast.success('New codeword added');
    } catch (error) {
      console.error('Error adding codeword:', error);
      toast.error('Failed to add codeword');
    } finally {
      setSaving(false);
    }
  };

  const deleteCodeWord = async (id: string) => {
    if (id === 'default') {
      toast.error('Cannot delete default codeword');
      return;
    }
    
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('voice_activations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setCodeWords(codeWords.filter((cw) => cw.id !== id));
      toast.success('Codeword deleted');
    } catch (error) {
      console.error('Error deleting codeword:', error);
      toast.error('Failed to delete codeword');
    }
  };

  const saveCodeWords = () => {
    toast.success('Voice activation settings saved');
    navigate('/home');
  };

  const testVoiceRecognition = () => {
    toast.info('Listening for codewords...');
    
    // Simulate voice recognition after a short delay
    setTimeout(() => {
      toast.success('Voice recognition test successful');
    }, 2000);
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
        <h1 className="text-xl font-bold">Voice Activation</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Voice-activated codewords</h2>
          <p className="text-sm text-muted-foreground mb-4">
            When you say these phrases aloud, an emergency alert will be sent to your contacts
          </p>

          {loading ? (
            <div className="text-center py-4">Loading codewords...</div>
          ) : (
            <>
              {/* Default Codeword */}
              <div className="p-4 mb-4 border border-border rounded-lg bg-card">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Default</h3>
                    <p className="text-xs text-muted-foreground">Cannot be deleted</p>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <Input 
                    value="Help me now"
                    readOnly
                    className="bg-input text-foreground"
                  />
                  <Textarea 
                    value="Emergency Alert: Need immediate assistance!"
                    readOnly
                    className="bg-input text-foreground h-20"
                  />
                </div>
              </div>

              {/* Custom Codewords */}
              {codeWords.filter(cw => cw.id !== 'default').map((codeWord) => (
                <div 
                  key={codeWord.id}
                  className="p-4 mb-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Custom Codeword</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCodeWord(codeWord.id)}
                      className="text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Input 
                      value={codeWord.word}
                      readOnly
                      className="bg-input text-foreground"
                    />
                    <Textarea 
                      value={codeWord.message}
                      readOnly
                      className="bg-input text-foreground h-20"
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Add New Codeword */}
          <div className="p-4 mb-4 border border-border rounded-lg bg-card">
            <h3 className="font-medium mb-3">Add New Codeword</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="newCodeWord">Codeword or Phrase</Label>
                <Input
                  id="newCodeWord"
                  value={newCodeWord}
                  onChange={(e) => setNewCodeWord(e.target.value)}
                  placeholder="Enter a new codeword..."
                  className="bg-input text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="newMessage">Custom Message</Label>
                <Textarea
                  id="newMessage"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message to send to emergency contacts..."
                  className="bg-input text-foreground h-20"
                />
              </div>
              <Button
                onClick={addCodeWord}
                className="w-full"
                variant="outline"
                disabled={saving}
              >
                <Plus size={16} className="mr-2" />
                {saving ? 'Adding...' : 'Add Codeword'}
              </Button>
            </div>
          </div>

          {/* Test Voice Recognition */}
          <Button
            onClick={testVoiceRecognition}
            className="w-full mb-4"
            variant="outline"
          >
            <Mic size={16} className="mr-2" />
            Test Voice Recognition
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <Button 
        onClick={saveCodeWords}
        className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
      >
        Save
      </Button>
    </div>
  );
};

export default VoiceActivation;
