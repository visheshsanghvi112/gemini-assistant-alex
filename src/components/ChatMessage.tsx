
import React, { useEffect, useRef } from 'react';
import { UserRound, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast = false }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.type === 'user';
  
  // Scroll the newest message into view
  useEffect(() => {
    if (isLast && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLast]);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex items-start gap-4 py-4 px-4 mb-2 rounded-xl animate-fade-in",
        isUser 
          ? "bg-white dark:bg-gray-800 shadow-soft dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)]" 
          : "glass dark:glass-dark"
      )}
      style={{ 
        animationDelay: '0.1s', 
        animationDuration: '0.4s'
      }}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
        isUser 
          ? "bg-alex-gray dark:bg-gray-700 text-alex-blue dark:text-alex-light-blue" 
          : "bg-alex-blue dark:bg-alex-dark-blue text-white"
      )}>
        {isUser ? <UserRound size={20} /> : <Bot size={20} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-1">
          {isUser ? 'You' : 'Alex'}
        </div>
        <div className="text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="text-xs text-alex-dark-gray dark:text-gray-400 mt-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
