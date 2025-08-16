"use client";

import { useCallback, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useDataCache } from '@/lib/DataCacheContext';
import MessageList, { ChatMessage } from './MessageList';
import ChatInput from './ChatInput';
import { postQuery } from '@/lib/api';

export default function ChatInterface() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { speak, stop, pause, resume, isPlaying, isPaused } = useTextToSpeech();
  const { chatMessages, setChatMessages, addChatMessage, isChatCached } = useDataCache();
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location in India if geolocation fails
          setUserLocation({ latitude: 26.4499, longitude: 80.3319 });
        }
      );
    } else {
      // Default to a central location in India if geolocation is not supported
      setUserLocation({ latitude: 26.4499, longitude: 80.3319 });
    }
  }, []);

  const handleSend = useCallback(async ({ text, imageUrl }: { text: string; imageUrl?: string | null }) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: text, 
      imageUrl: imageUrl || null
    };
    addChatMessage(userMessage);
    setIsLoading(true);

    try {
      // Send query directly to backend with location and user data
      const queryData = {
        query: text,
        imageUrl: imageUrl || undefined,
        language: language,
        latitude: userLocation?.latitude || 26.4499,
        longitude: userLocation?.longitude || 80.3319,
        state_id: user?.state_id || 8, // Default to Uttar Pradesh
        district_id: user?.district_id ? [user.district_id] : [104] // Default to Kanpur Nagar
      };

      const data = await postQuery(queryData);
      const backendResponse = data.response;

      // Add response to UI
      const aiMessage: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: backendResponse || 'No response received'
      };
      addChatMessage(aiMessage);

      // Speak the response aloud in the user's language
      if (backendResponse && backendResponse.trim()) {
        speak(backendResponse, language);
      }

    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMsg = t('sorryError');
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMsg
      };
      addChatMessage(aiMessage);
    } finally {
      setIsLoading(false);
    }
  }, [language, speak, t, userLocation, user, addChatMessage]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white">
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('assistantTitle')}</h2>
            <p className="text-xs text-gray-500">{t('assistantDescription')}</p>
          </div>
          
          {/* Global TTS Controls */}
          {(isPlaying || isPaused) && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">TTS:</span>
              
              {/* Pause button */}
              {isPlaying && !isPaused && (
                <button
                  aria-label="Pause speech"
                  className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded"
                  onClick={pause}
                  title="Pause speech"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              )}
              
              {/* Resume button */}
              {isPaused && (
                <button
                  aria-label="Resume speech"
                  className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded"
                  onClick={resume}
                  title="Resume speech"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              
              {/* Stop button */}
              <button
                aria-label="Stop speech"
                className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded"
                onClick={stop}
                title="Stop speech"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* START: Replace the old MessageList component with this block */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.length === 0 ? (
          // If there are no messages, show the welcome message
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
              <p className="text-lg text-gray-500">{t('welcomeMessage')}</p>
            </div>
          </div>
        ) : (
          // Otherwise, show the list of messages
          <MessageList messages={chatMessages} />
        )}
      </div>
      {/* END: Replacement block */}

      {/* The input form remains fixed at the bottom */}
      {isLoading && (
        <div className="px-4 pb-2 text-xs text-gray-500 flex-shrink-0">{t('generatingResponse')}</div>
      )}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
