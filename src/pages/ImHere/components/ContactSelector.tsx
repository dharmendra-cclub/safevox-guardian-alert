
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ContactSelectorProps } from '../types';

const ContactSelector: React.FC<ContactSelectorProps> = ({
  contacts,
  loading,
  toggleContactSelection
}) => {
  if (loading) {
    return (
      <div className="py-4 text-center">Loading contacts...</div>
    );
  }
  
  if (contacts.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No emergency contacts added yet
      </div>
    );
  }
  
  return (
    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex items-center space-x-2">
          <Checkbox 
            id={contact.id} 
            checked={contact.selected}
            onCheckedChange={() => toggleContactSelection(contact.id)}
          />
          <Label htmlFor={contact.id} className="flex-1">
            {contact.name} - {contact.phone}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default ContactSelector;
