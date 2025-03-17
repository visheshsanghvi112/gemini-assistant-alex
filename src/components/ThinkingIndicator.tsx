
import React from 'react';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 py-2 animate-fade-in">
      <div className="text-sm text-alex-dark-gray font-medium">Alex is thinking</div>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-full bg-alex-blue" 
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
