import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SendHorizonal, CircleOff } from 'lucide-react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

import VoiceButton from './VoiceButton';
import ChatMessage from './ChatMessage';
import AnimatedWaves from './AnimatedWaves';
import ThinkingIndicator from './ThinkingIndicator';
import { fetchGeminiResponse } from '../services/geminiService';
import { AssistantState, Message } from '../types';
import { cn } from '@/lib/utils';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [state, setState] = useState<AssistantState>(AssistantState.IDLE);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: 'assistant',
        content: "Hello, I'm Alex, your personal assistant powered by Google Gemini. How can I help you today?",
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      setIsInitialized(true);
      
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionConstructor) {
          recognitionRef.current = new SpeechRecognitionConstructor();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          
          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');
            
            setInput(transcript);
          };
          
          recognitionRef.current.onend = () => {
            if (state === AssistantState.LISTENING) {
              handleSendMessage();
            }
          };
        }
      } else {
        toast.error("Your browser doesn't support speech recognition");
      }
    }
  }, [isInitialized, state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleMicrophoneClick = () => {
    if (state === AssistantState.IDLE) {
      startListening();
    } else if (state === AssistantState.LISTENING) {
      stopListening();
    } else if (state === AssistantState.SPEAKING) {
      stopSpeaking();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setState(AssistantState.LISTENING);
        toast.info("I'm listening...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Couldn't start listening");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (input.trim()) {
        handleSendMessage();
      } else {
        setState(AssistantState.IDLE);
      }
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setState(AssistantState.IDLE);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      speechSynthesisRef.current = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.2;
      speechSynthesisRef.current.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK English Female') || 
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Female')
      ) || voices.find(voice => 
        voice.name.includes('Google') && !voice.name.includes('Male')
      );
      
      if (femaleVoice) {
        speechSynthesisRef.current.voice = femaleVoice;
      }
      
      speechSynthesisRef.current.onstart = () => {
        setState(AssistantState.SPEAKING);
      };
      
      speechSynthesisRef.current.onend = () => {
        setState(AssistantState.IDLE);
      };
      
      window.speechSynthesis.speak(speechSynthesisRef.current);
    } else {
      toast.error("Your browser doesn't support speech synthesis");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && state !== AssistantState.LISTENING) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setState(AssistantState.PROCESSING);
    
    try {
      const response = await fetchGeminiResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        type: 'assistant',
        content: response.text,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      speakMessage(response.text);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Couldn't get a response");
      setState(AssistantState.IDLE);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto overflow-hidden">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-4"
      >
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLast={index === messages.length - 1}
          />
        ))}
        
        {state === AssistantState.PROCESSING && <ThinkingIndicator state={AssistantState.PROCESSING} />}
        {state === AssistantState.LISTENING && <ThinkingIndicator state={AssistantState.LISTENING} text="Listening to you..." />}
        {state === AssistantState.SPEAKING && <ThinkingIndicator state={AssistantState.SPEAKING} text="Alex is responding..." />}
      </div>
      
      <AnimatedWaves 
        isActive={state === AssistantState.LISTENING || state === AssistantState.SPEAKING} 
        audioLevel={state === AssistantState.LISTENING ? 0.8 : 0.5}
      />
      
      <div className="p-4 border-t border-alex-gray/10 dark:border-gray-700/20 bg-white dark:bg-gray-800 shadow-soft dark:shadow-[0_-4px_12px_rgba(0,0,0,0.1)] transition-colors duration-300">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={cn(
              "w-full py-3 px-4 pr-12 rounded-xl border dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-600 focus:outline-none transition-all",
              state === AssistantState.LISTENING 
                ? "border-alex-blue dark:border-alex-light-blue ring-1 ring-alex-blue/50 dark:ring-alex-light-blue/50" 
                : "border-alex-gray/20 dark:border-gray-600 focus:border-alex-blue dark:focus:border-alex-light-blue focus:ring-1 focus:ring-alex-blue/50 dark:focus:ring-alex-light-blue/50"
            )}
            disabled={state === AssistantState.PROCESSING}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || state === AssistantState.PROCESSING}
            className={cn(
              "absolute right-3 text-white p-1.5 rounded-lg transition-all",
              input.trim() 
                ? "bg-alex-blue hover:bg-alex-dark-blue dark:bg-alex-light-blue dark:hover:bg-alex-blue"
                : "bg-alex-dark-gray/30 dark:bg-gray-600/50 cursor-not-allowed"
            )}
          >
            <SendHorizonal size={20} />
          </button>
        </div>
        
        <div className="flex justify-center -mt-8">
          <VoiceButton 
            state={state} 
            onClick={handleMicrophoneClick}
          />
        </div>
        
        <div className="flex justify-center mt-4">
          <p className="text-xs text-alex-dark-gray dark:text-gray-400">
            {state === AssistantState.IDLE && "Tap the mic to speak"}
            {state === AssistantState.LISTENING && "Listening... tap again when done"}
            {state === AssistantState.PROCESSING && "Processing your request..."}
            {state === AssistantState.SPEAKING && "Speaking... tap to stop"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
