
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { CodeWord } from '@/types/voice-activation';
import { 
  fetchCodeWords, 
  addCodeWordToDatabase, 
  deleteCodeWordFromDatabase,
  fetchEmergencyContacts
} from '@/services/VoiceActivationService';
import CodeWordItem from '@/components/voice-activation/CodeWordItem';
import AddCodeWordForm from '@/components/voice-activation/AddCodeWordForm';

const VoiceActivation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [codeWords, setCodeWords] = useState<CodeWord[]>([
    {
      id: 'default',
      word: 'Help me now',
      message: 'Emergency Alert: Need immediate assistance!',
      contacts: []
    },
  ]);
  const [contactNames, setContactNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch contact names for display
        const contacts = await fetchEmergencyContacts(user.id);
        setContactNames(contacts);
        
        // Fetch custom codewords
        const words = await fetchCodeWords(user.id);
        
        // Create default codeword with all contacts
        const defaultCodeWord = {
          id: 'default',
          word: 'Help me now',
          message: 'Emergency Alert: Need immediate assistance!',
          contacts: Object.keys(contacts) // All contacts for default codeword
        };
        
        setCodeWords([defaultCodeWord, ...words]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const addCodeWord = async (newCodeWord: string, newMessage: string, contactIds: string[]) => {
    if (!user) return;
    
    if (newCodeWord.trim() === '') {
      toast.error('Please enter a codeword');
      return;
    }
    
    setSaving(true);
    
    try {
      const newCodeWordItem = await addCodeWordToDatabase(user.id, newCodeWord, newMessage, contactIds);
      
      if (newCodeWordItem) {
        setCodeWords([...codeWords, newCodeWordItem]);
        toast.success('New codeword added');
      }
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
    
    const success = await deleteCodeWordFromDatabase(user.id, id);
    
    if (success) {
      setCodeWords(codeWords.filter((cw) => cw.id !== id));
      toast.success('Codeword deleted');
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
              <CodeWordItem 
                codeWord={codeWords.find(cw => cw.id === 'default')!} 
                isDefault={true}
                contactNames={contactNames}
                onDelete={deleteCodeWord}
              />

              {/* Custom Codewords */}
              {codeWords.filter(cw => cw.id !== 'default').map((codeWord) => (
                <CodeWordItem 
                  key={codeWord.id}
                  codeWord={codeWord}
                  contactNames={contactNames}
                  onDelete={deleteCodeWord}
                />
              ))}
            </>
          )}

          {/* Add New Codeword */}
          <AddCodeWordForm onAddCodeWord={addCodeWord} saving={saving} />

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
