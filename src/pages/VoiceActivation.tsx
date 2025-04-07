
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash, Plus, Mic } from 'lucide-react';
import { toast } from 'sonner';

interface CodeWord {
  id: string;
  word: string;
  message: string;
}

const VoiceActivation: React.FC = () => {
  const navigate = useNavigate();
  const [codeWords, setCodeWords] = useState<CodeWord[]>([
    {
      id: 'default',
      word: 'Help me now',
      message: 'Emergency Alert: Need immediate assistance!',
    },
  ]);
  
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const addCodeWord = () => {
    if (newCodeWord.trim() === '') {
      toast.error('Please enter a codeword');
      return;
    }
    
    const id = `cw-${Date.now()}`;
    setCodeWords([
      ...codeWords,
      {
        id,
        word: newCodeWord,
        message: newMessage || 'Emergency alert!',
      },
    ]);
    
    setNewCodeWord('');
    setNewMessage('');
    toast.success('New codeword added');
  };

  const deleteCodeWord = (id: string) => {
    if (id === 'default') {
      toast.error('Cannot delete default codeword');
      return;
    }
    
    setCodeWords(codeWords.filter((cw) => cw.id !== id));
    toast.success('Codeword deleted');
  };

  const saveCodeWords = () => {
    // In a real app, this would save to backend or local storage
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
              >
                <Plus size={16} className="mr-2" />
                Add Codeword
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
