
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

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [state, setState] = useState<AssistantState>(AssistantState.IDLE);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Initialize the assistant with a welcome message
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
      
      // Add initial setup for speech recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
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
      } else {
        toast.error("Your browser doesn't support speech recognition");
      }
    }
  }, [isInitialized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle the microphone button click
  const handleMicrophoneClick = () => {
    if (state === AssistantState.IDLE) {
      startListening();
    } else if (state === AssistantState.LISTENING) {
      stopListening();
    } else if (state === AssistantState.SPEAKING) {
      stopSpeaking();
    }
  };

  // Start listening for speech
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

  // Stop listening for speech
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

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setState(AssistantState.IDLE);
    }
  };

  // Speak the message
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      speechSynthesisRef.current = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      speechSynthesisRef.current.volume = 1.0;
      
      // Get the appropriate voice (this could be a user preference)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Daniel')
      );
      
      if (preferredVoice) {
        speechSynthesisRef.current.voice = preferredVoice;
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

  // Function to send a message
  const handleSendMessage = async () => {
    if (!input.trim() && state !== AssistantState.LISTENING) return;
    
    // Create the user message
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    // Update UI state
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setState(AssistantState.PROCESSING);
    
    try {
      // Get response from Gemini API
      const response = await fetchGeminiResponse(userMessage.content);
      
      // Create the assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        type: 'assistant',
        content: response.text,
        timestamp: new Date(),
      };
      
      // Update messages
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speakMessage(response.text);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Couldn't get a response");
      setState(AssistantState.IDLE);
    }
  };

  // Handle Enter key in the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto overflow-hidden">
      {/* Main content area with messages */}
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
        
        {state === AssistantState.PROCESSING && <ThinkingIndicator />}
      </div>
      
      {/* Voice visualization */}
      <AnimatedWaves 
        isActive={state === AssistantState.LISTENING || state === AssistantState.SPEAKING} 
        audioLevel={state === AssistantState.LISTENING ? 0.8 : 0.5}
      />
      
      {/* Input area */}
      <div className="p-4 border-t border-alex-gray/10 bg-white shadow-soft">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={cn(
              "w-full py-3 px-4 pr-12 rounded-xl border border-alex-gray/20 focus:border-alex-blue focus:ring-1 focus:ring-alex-blue outline-none transition-all",
              state === AssistantState.LISTENING && "bg-alex-gray/5 border-alex-blue"
            )}
            disabled={state === AssistantState.PROCESSING}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || state === AssistantState.PROCESSING}
            className={cn(
              "absolute right-3 text-white p-1.5 rounded-lg transition-all",
              input.trim() 
                ? "bg-alex-blue hover:bg-alex-dark-blue"
                : "bg-alex-dark-gray/30 cursor-not-allowed"
            )}
          >
            <SendHorizonal size={20} />
          </button>
        </div>
        
        {/* Voice button */}
        <div className="flex justify-center -mt-8">
          <VoiceButton 
            state={state} 
            onClick={handleMicrophoneClick}
          />
        </div>
        
        <div className="flex justify-center mt-4">
          <p className="text-xs text-alex-dark-gray">
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
