
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash } from 'lucide-react';
import { CodeWord } from '@/types/voice-activation';

interface CodeWordItemProps {
  codeWord: CodeWord;
  isDefault?: boolean;
  onDelete: (id: string) => void;
}

const CodeWordItem: React.FC<CodeWordItemProps> = ({ codeWord, isDefault = false, onDelete }) => {
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
      </div>
    </div>
  );
};

export default CodeWordItem;
