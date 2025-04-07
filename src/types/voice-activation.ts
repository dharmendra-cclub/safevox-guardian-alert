
export interface CodeWord {
  id: string;
  word: string;
  message: string;
  contacts?: string[]; // Array of contact IDs
}

export interface VoiceActivationDB {
  id: string;
  user_id: string;
  code_word: string;
  message: string;
  contacts?: string[]; // Array of contact IDs
  created_at: string;
  updated_at: string;
}
