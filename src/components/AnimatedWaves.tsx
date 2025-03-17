
import React, { useEffect, useRef } from 'react';

interface AnimatedWavesProps {
  isActive: boolean;
  audioLevel?: number;
}

const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ isActive, audioLevel = 0.5 }) => {
  const waveCount = 18;
  const waves = useRef<number[]>(Array.from({ length: waveCount }, (_, i) => i));

  // Generate random heights when component mounts
  useEffect(() => {
    waves.current = Array.from({ length: waveCount }, () => Math.random());
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-20 w-full overflow-hidden">
      <div className="flex items-center justify-center">
        {waves.current.map((_, index) => {
          // Calculate dynamic height based on position and audio level
          const heightFactor = 0.3 + (Math.sin((index / waveCount) * Math.PI) * 0.7 * audioLevel);
          const delayFactor = (index / waveCount) * 0.5;
          
          return (
            <div
              key={index}
              className="wave-bar"
              style={{
                height: `${heightFactor * 100}%`,
                animationName: 'wave',
                animationDuration: '1.5s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                animationDelay: `${delayFactor}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedWaves;
