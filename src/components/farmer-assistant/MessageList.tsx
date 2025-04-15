
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/farmerAssistant';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="h-[400px] px-6">
      <div className="space-y-4 pt-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
              <Avatar className="h-8 w-8">
                {message.role === 'assistant' ? (
                  <>
                    <AvatarImage src="/assets/assistant-avatar.png" alt="AI Assistant" />
                    <AvatarFallback className="bg-cropmate-primary text-white">AI</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/assets/user-avatar.png" alt="User" />
                    <AvatarFallback className="bg-cropmate-secondary text-white">U</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <div 
                className={`p-3 rounded-lg text-sm ${
                  message.role === 'user' 
                    ? 'bg-cropmate-primary text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-gray-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
