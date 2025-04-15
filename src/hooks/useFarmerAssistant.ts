
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/farmerAssistant';

export const useFarmerAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your farming assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessageToAssistant = async (userMessage: string) => {
    // Add user message to chat
    addMessage('user', userMessage);
    setIsLoading(true);
    
    try {
      // Call our AI chat assistant via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('farmer-assistant', {
        body: { message: userMessage }
      });
      
      if (error) throw error;
      
      // Add assistant response to chat
      addMessage(
        'assistant', 
        data.reply || "I'm sorry, I couldn't process your request. Please try again."
      );
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      
      // Fallback response when API call fails
      addMessage(
        'assistant', 
        "I'm currently having trouble connecting to my knowledge base. Here's some general guidance: For crop issues, check for pests, diseases, and water/nutrient levels. For market questions, consider local demand and seasonal pricing trends. Please try your specific question again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessageToAssistant
  };
};
