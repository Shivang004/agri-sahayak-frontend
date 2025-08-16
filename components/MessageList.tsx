"use client";

import { useEffect, useRef } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/lib/LanguageContext';
import { formatChatMessage } from '@/lib/markdownUtils';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
};

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  const { speak, stop, pause, resume, isPlaying, isPaused } = useTextToSpeech();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 p-4">
      {messages.map((msg) => (
        <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
          <div
            className={`inline-block max-w-[80%] rounded-2xl text-sm shadow ${
              msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-gray-900'
            }`}
          >
            {/* This renders the image if it exists on the message object */}
            {msg.imageUrl && (
              <img 
                src={msg.imageUrl} 
                alt="User upload" 
                className="w-full h-auto rounded-t-2xl object-cover" 
              />
            )}
            
            <div className="px-4 py-3 flex items-start">
              {msg.role === 'assistant' ? (
                // For assistant messages, use formatted HTML
                <div 
                  className="flex-1"
                  dangerouslySetInnerHTML={{ 
                    __html: formatChatMessage(msg.content) 
                  }}
                />
              ) : (
                // For user messages, keep simple text formatting
                <span className="whitespace-pre-wrap break-words">{msg.content}</span>
              )}
              
              {msg.role === 'assistant' && (
                <div className="ml-2 flex items-center space-x-1 flex-shrink-0">
                  {/* Play/Speak button */}
                  {!isPlaying && !isPaused && (
                    <button
                      aria-label="Speak message"
                      className="text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={() => speak(msg.content, language)}
                      title="Read aloud"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M3 10v4a1 1 0 001 1h3l3.293 3.293A1 1 0 0011 18v-12a1 1 0 00-1.707-.707L7 8H4a1 1 0 00-1 1z" />
                        <path d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Pause button */}
                  {isPlaying && !isPaused && (
                    <button
                      aria-label="Pause speech"
                      className="text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={pause}
                      title="Pause"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Resume button */}
                  {isPaused && (
                    <button
                      aria-label="Resume speech"
                      className="text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={resume}
                      title="Resume"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Stop button */}
                  {(isPlaying || isPaused) && (
                    <button
                      aria-label="Stop speech"
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      onClick={stop}
                      title="Stop"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M6 6h12v12H6z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}