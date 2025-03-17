
import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssistantState } from '@/types';

interface VoiceButtonProps {
  state: AssistantState;
  onClick: () => void;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ state, onClick, className }) => {
  const isListening = state === AssistantState.LISTENING;
  const isProcessing = state === AssistantState.PROCESSING;
  const isSpeaking = state === AssistantState.SPEAKING;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-strong",
        isListening 
          ? "bg-alex-blue text-white scale-110 animate-pulse-soft" 
          : isProcessing || isSpeaking
            ? "bg-alex-light-blue text-white"
            : "bg-white text-alex-blue hover:bg-alex-blue hover:text-white",
        className
      )}
      disabled={isProcessing}
    >
      <div className="relative z-10">
        {isListening && <Mic className="w-7 h-7" />}
        {isProcessing && (
          <div className="w-6 h-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
        )}
        {isSpeaking && <Square className="w-6 h-6" />}
        {state === AssistantState.IDLE && <Mic className="w-7 h-7" />}
      </div>
      
      {/* Expanding ring animation */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-alex-blue opacity-30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-alex-blue opacity-50 animate-pulse" />
        </>
      )}
    </button>
  );
};

export default VoiceButton;
