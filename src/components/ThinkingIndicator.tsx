
import React from 'react';
import { AssistantState } from '@/types';

interface ThinkingIndicatorProps {
  state?: AssistantState;
  text?: string;
}

const ThinkingIndicator = ({ state = AssistantState.PROCESSING, text }: ThinkingIndicatorProps) => {
  const getStateText = () => {
    switch (state) {
      case AssistantState.PROCESSING:
        return text || 'Alex is thinking';
      case AssistantState.LISTENING:
        return text || 'Alex is listening';
      case AssistantState.SPEAKING:
        return text || 'Alex is speaking';
      default:
        return text || 'Alex is thinking';
    }
  };

  const renderWaveform = () => {
    return (
      <div className="flex space-x-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`w-1.5 h-8 rounded-full ${
              state === AssistantState.LISTENING 
                ? 'bg-indigo-400 dark:bg-indigo-300' 
                : state === AssistantState.SPEAKING
                  ? 'bg-pink-400 dark:bg-pink-300'
                  : 'bg-indigo-500 dark:bg-indigo-400'
            }`}
            style={{ 
              height: `${Math.max(8, 24 * Math.sin((i / 4) * Math.PI + Date.now() / 500) + 16)}px`,
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between py-3 px-5 animate-fade-in rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 shadow-md">
      <div className="text-sm text-primary font-medium dark:text-indigo-300">
        {getStateText()}
      </div>
      {renderWaveform()}
    </div>
  );
};

export default ThinkingIndicator;
