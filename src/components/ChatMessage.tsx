
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
        "group flex items-start gap-4 py-4 px-4 mb-3 rounded-xl animate-fade-in",
        isUser 
          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20" 
          : "bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
      )}
      style={{ 
        animationDelay: '0.1s', 
        animationDuration: '0.4s'
      }}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
        isUser 
          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
          : "bg-gradient-to-br from-sky-400 to-indigo-500 text-white"
      )}>
        {isUser ? <UserRound size={20} /> : <Bot size={20} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          {isUser ? 'You' : 'Alex'}
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={cn(
          "text-sm leading-relaxed rounded-xl p-3 mb-1 shadow-sm",
          isUser 
            ? "chat-bubble user" 
            : "chat-bubble assistant"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
