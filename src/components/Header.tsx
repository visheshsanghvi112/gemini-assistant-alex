
import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("px-6 py-4 flex items-center justify-between", className)}>
      <div className="flex items-center space-x-2">
        <div className="bg-alex-blue text-white rounded-full w-10 h-10 flex items-center justify-center shadow-soft">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="font-medium text-xl text-alex-black">Alex</h1>
          <p className="text-xs text-alex-dark-gray">Powered by Gemini</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-soft mr-2"></div>
        <span className="text-xs font-medium text-alex-dark-gray">Online</span>
      </div>
    </header>
  );
};

export default Header;
