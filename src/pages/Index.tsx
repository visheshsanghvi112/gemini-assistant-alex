
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import Header from '@/components/Header';
import AIAssistant from '@/components/AIAssistant';
import { toast } from 'sonner';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-alex-gray to-white">
      {/* API Key Notice */}
      {showNotice && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-center">
          <p className="text-amber-800 text-sm">
            You need to add your Gemini API key in <code>src/services/geminiService.ts</code>
            <button 
              className="ml-3 text-amber-900 hover:text-amber-700 text-xs bg-amber-200 px-2 py-0.5 rounded-md"
              onClick={() => setShowNotice(false)}
            >
              Dismiss
            </button>
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Header className="py-6" />
        
        {/* Main container with glass effect */}
        <div className="flex-1 glass rounded-2xl overflow-hidden shadow-strong mb-8 flex flex-col">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default Index;
