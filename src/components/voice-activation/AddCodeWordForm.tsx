
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface AddCodeWordFormProps {
  onAddCodeWord: (word: string, message: string) => Promise<void>;
  saving: boolean;
}

const AddCodeWordForm: React.FC<AddCodeWordFormProps> = ({ onAddCodeWord, saving }) => {
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async () => {
    await onAddCodeWord(newCodeWord, newMessage);
    setNewCodeWord('');
    setNewMessage('');
  };

  return (
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
          onClick={handleSubmit}
          className="w-full"
          variant="outline"
          disabled={saving}
        >
          <Plus size={16} className="mr-2" />
          {saving ? 'Adding...' : 'Add Codeword'}
        </Button>
      </div>
    </div>
  );
};

export default AddCodeWordForm;
