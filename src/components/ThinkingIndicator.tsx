
import React from 'react';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-center space-x-3 py-3 px-4 animate-fade-in rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
      <div className="text-sm text-primary font-medium dark:text-indigo-300">Alex is thinking</div>
      <div className="flex space-x-1.5">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400" 
            style={{ 
              animation: 'pulse-soft 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ThinkingIndicator;
