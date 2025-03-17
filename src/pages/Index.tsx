
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import Header from '@/components/Header';
import AIAssistant from '@/components/AIAssistant';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [showNotice, setShowNotice] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    // Set up the voices for speech synthesis
    const initVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };

    // Initialize voices
    initVoices();

    // Some browsers need this event to load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    // Show a welcome toast
    setTimeout(() => {
      toast.info("Welcome to Alex, your personal AI assistant!");
    }, 1000);

    // Check for microphone permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone access granted");
        })
        .catch(() => {
          toast.error("Microphone access is required for voice interactions");
        });
    }

    return () => {
      // Clean up
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-rose-50 dark:from-gray-900 dark:to-slate-900 dark:text-white transition-colors duration-300">
      {/* API Key Notice */}
      {showNotice && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 p-3 text-center">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            You need to add your Gemini API key in <code className="bg-amber-100 dark:bg-amber-800/50 px-1.5 py-0.5 rounded">src/services/geminiService.ts</code>
            <button 
              className="ml-3 text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 text-xs bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-md transition-colors"
              onClick={() => setShowNotice(false)}
            >
              Dismiss
            </button>
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Header className="py-6">
          <ThemeToggle />
        </Header>
        
        {/* Main container with glass effect */}
        <div className="flex-1 rounded-2xl overflow-hidden mb-8 flex flex-col bg-white/70 backdrop-blur-md shadow-lg dark:bg-gray-800/40 dark:backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/50 dark:border-gray-700/30">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default Index;
