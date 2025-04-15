
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isSpeechSupported: boolean;
  isListening: boolean;
  toggleListening: () => void;
  handleSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  isLoading,
  isSpeechSupported,
  isListening,
  toggleListening,
  handleSendMessage
}) => {
  return (
    <form 
      className="flex items-center w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }}
    >
      <Input
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        className="flex-grow"
      />
      
      {isSpeechSupported && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleListening}
          disabled={isLoading}
          className={isListening ? 'bg-red-100' : ''}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
      
      <Button 
        type="submit" 
        size="icon"
        disabled={!input.trim() || isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

export default MessageInput;
