
export interface CodeWord {
  id: string;
  word: string;
  message: string;
}

export interface VoiceActivationDB {
  id: string;
  user_id: string;
  code_word: string;
  message: string;
  created_at: string;
  updated_at: string;
}
