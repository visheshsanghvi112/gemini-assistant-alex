
import { GeminiResponse } from '../types';

// This would be replaced with your actual API key
const API_KEY = 'YOUR_GEMINI_API_KEY';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const fetchGeminiResponse = async (message: string): Promise<GeminiResponse> => {
  try {
    console.log('Fetching response from Gemini API...');
    
    // In a real implementation, this would be a call to the Gemini API
    // This is a mock implementation for demonstration purposes
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response received:', data);
    
    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
    
    return { text };
  } catch (error) {
    console.error('Error fetching from Gemini API:', error);
    // Gracefully handle errors with a user-friendly message
    return { text: "I'm having trouble connecting to my brain right now. Please try again in a moment." };
  }
};
