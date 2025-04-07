
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  MoreVertical, 
  User,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Contact {
  id: string;
  name: string;
  phone: string;
  initials: string;
}

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Mom', phone: '+91 9560 9034', initials: 'M' },
    { id: '2', name: 'Dad', phone: '+91 9560 9034', initials: 'D' },
    { id: '3', name: 'Sister', phone: '+91 9560 9034', initials: 'S' },
    { id: '4', name: 'Granny', phone: '+91 9560 9034', initials: 'G' },
  ]);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addContact = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Please enter both name and phone number');
      return;
    }
    
    const initials = name.charAt(0).toUpperCase();
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name,
      phone,
      initials,
    };
    
    setContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setShowAddForm(false);
    toast.success('Contact added successfully');
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    toast.success('Contact removed');
  };

  const saveContacts = () => {
    // In a real app, this would save to backend or local storage
    toast.success('Emergency contacts saved');
    navigate('/home');
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
        <h1 className="text-xl font-bold">Emergency Contacts</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No emergency contacts added yet
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 bg-safevox-primary/20">
                    <AvatarFallback>{contact.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteContact(contact.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {showAddForm ? (
          <div className="p-4 mb-4 border border-border rounded-lg bg-card">
            <h3 className="font-medium mb-3">Add New Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User size={18} className="mr-2 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contact name"
                  className="bg-input text-foreground"
                />
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="bg-input text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addContact}
                  className="flex-1 bg-safevox-primary hover:bg-safevox-primary/90"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4"
            variant="outline"
          >
            <Plus size={16} className="mr-2" />
            Add New Contact
          </Button>
        )}
      </div>

      {/* Save Button */}
      <Button 
        onClick={saveContacts}
        className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
      >
        Save
      </Button>
    </div>
  );
};

export default EmergencyContacts;
