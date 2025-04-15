
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MessageList from './farmer-assistant/MessageList';
import MessageInput from './farmer-assistant/MessageInput';
import { useFarmerAssistant } from '@/hooks/useFarmerAssistant';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const FarmerAssistant = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessageToAssistant } = useFarmerAssistant();
  const { isListening, isSpeechSupported, toggleListening, stopListening } = useSpeechRecognition(
    (transcript) => setInput(transcript)
  );

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    
    const userMessage = input;
    setInput('');
    await sendMessageToAssistant(userMessage);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Farming Assistant</CardTitle>
        <CardDescription>
          Ask me anything about farming, crops, or market trends
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <MessageList messages={messages} />
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t bg-gray-50">
        <MessageInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          isSpeechSupported={isSpeechSupported}
          isListening={isListening}
          toggleListening={toggleListening}
          handleSendMessage={handleSendMessage}
        />
      </CardFooter>
    </Card>
  );
};

export default FarmerAssistant;
