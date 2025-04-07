
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash } from 'lucide-react';
import { CodeWord } from '@/types/voice-activation';

interface CodeWordItemProps {
  codeWord: CodeWord;
  isDefault?: boolean;
  contactNames?: Record<string, string>;
  onDelete: (id: string) => void;
}

const CodeWordItem: React.FC<CodeWordItemProps> = ({ 
  codeWord, 
  isDefault = false, 
  contactNames = {},
  onDelete 
}) => {
  return (
    <div className="p-4 mb-4 border border-border rounded-lg bg-card">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-medium">{isDefault ? 'Default' : 'Custom Codeword'}</h3>
          {isDefault && <p className="text-xs text-muted-foreground">Cannot be deleted</p>}
        </div>
        {!isDefault && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(codeWord.id)}
            className="text-destructive"
          >
            <Trash size={16} />
          </Button>
        )}
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
        
        {/* Mapped contacts */}
        {codeWord.contacts && codeWord.contacts.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Emergency contacts:</p>
            <div className="flex flex-wrap gap-1">
              {codeWord.contacts.map(contactId => (
                <Badge key={contactId} variant="secondary">
                  {contactNames[contactId] || 'Unknown contact'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeWordItem;
