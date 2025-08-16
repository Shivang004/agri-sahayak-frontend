"use client";

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useSpeechToText } from '@/hooks/useSpeechToText';

export default function ChatInput({
  onSend
}: {
  onSend: (payload: { text: string; imageUrl?: string | null }) => void;
}) {
  const { language, t } = useLanguage();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { isSupported, isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  function clearImage() {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // Stop listening if currently active
    if (isListening) {
      stopListening();
    }
    
    onSend({ text: trimmed, imageUrl });
    setText('');
    clearImage(); // Clear the image and reset file input after sending
    clearTranscript(); // Clear speech transcript after sending
  }

  function handlePickImage() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Use FileReader to convert the image to a Base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result is a Base64 data URL (e.g., "data:image/png;base64,...")
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function toggleMic() {
    if (!isSupported) return;
    if (isListening) {
      stopListening();
    } else {
      // If starting fresh and there's existing text, clear it
      if (text.trim() === '') {
        clearTranscript();
      }
      startListening(language);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handlePickImage}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          title={t('uploadImage')}
        >
          {t('image')}
        </button>
        <div className="relative flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder={t('placeholder')}
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 ${
              isListening ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-gray-800'
            }`}
            title={isSupported ? (isListening ? t('stopListening') : t('startListening')) : t('speechNotSupported')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
              <path d="M19 11a1 1 0 10-2 0 5 5 0 11-10 0 1 1 0 10-2 0 7 7 0 0012 0z" />
              <path d="M13 19.95V22h-2v-2.05a8.001 8.001 0 01-6.938-6.938l1.988-.25A6 6 0 0018.95 12l.25 1.988A8.001 8.001 0 0113 19.95z" />
            </svg>
          </button>
        </div>
        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          {t('send')}
        </button>
      </div>
      {imageUrl && (
        <div className="mt-2 flex items-center gap-3">
          <img src={imageUrl} alt="Selected" className="h-12 w-12 rounded object-cover" />
          <button type="button" className="text-xs text-red-600 hover:underline" onClick={clearImage}>
            {t('removeImage')}
          </button>
        </div>
      )}
    </form>
  );
}

