
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type DbContact = Database['public']['Tables']['emergency_contacts']['Row'];

interface Contact extends DbContact {
  selected?: boolean;
}

interface AddCodeWordFormProps {
  onAddCodeWord: (word: string, message: string, contactIds: string[]) => Promise<void>;
  saving: boolean;
}

const AddCodeWordForm: React.FC<AddCodeWordFormProps> = ({ onAddCodeWord, saving }) => {
  const { user } = useAuth();
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch contacts when the component mounts or when showContacts becomes true
    if (showContacts && user) {
      fetchContacts();
    }
  }, [showContacts, user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setContacts(data.map(contact => ({
        ...contact,
        selected: false
      })));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (id: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id 
        ? { ...contact, selected: !contact.selected } 
        : contact
    ));
  };

  const handleSubmit = async () => {
    const selectedContactIds = contacts
      .filter(contact => contact.selected)
      .map(contact => contact.id);
    
    await onAddCodeWord(newCodeWord, newMessage, selectedContactIds);
    setNewCodeWord('');
    setNewMessage('');
    setShowContacts(false);
    // Reset contacts selection
    setContacts(contacts.map(contact => ({
      ...contact,
      selected: false
    })));
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
        
        <div>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-2"
            onClick={() => setShowContacts(!showContacts)}
          >
            <Users size={16} className="mr-2" />
            {showContacts ? 'Hide Contact Selection' : 'Select Emergency Contacts'}
          </Button>
          
          {showContacts && (
            <div className="mt-2 border border-border rounded-lg p-3 bg-background">
              <h4 className="text-sm font-medium mb-2">Select contacts for this codeword</h4>
              
              {loading ? (
                <div className="text-center py-2 text-sm">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No emergency contacts added yet
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`contact-${contact.id}`} 
                        checked={contact.selected}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                      />
                      <Label htmlFor={`contact-${contact.id}`} className="text-sm flex-1">
                        {contact.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
