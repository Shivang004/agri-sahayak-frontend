import { useCallback, useEffect, useRef, useState } from 'react';

// Language code mapping for speech recognition
const getSpeechRecognitionLanguageCode = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'pa': 'pa-IN',
    'mr': 'mr-IN',
    'te': 'te-IN',
    'ta': 'ta-IN'
  };
  return languageMap[lang] || 'en-IN';
};

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T }
  ? T
  : any;

type WebkitSpeechRecognitionType = typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : any;

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechToText() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const shouldBeListeningRef = useRef<boolean>(false);

  useEffect(() => {
    const RecognitionCtor =
      typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;
    if (RecognitionCtor) {
      setIsSupported(true);
      const recognition = new RecognitionCtor();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Append the final transcript to the accumulated text
        if (finalTranscript) {
          accumulatedTranscriptRef.current += finalTranscript;
        }

        // Update the state with both accumulated and interim text
        setTranscript(accumulatedTranscriptRef.current + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        shouldBeListeningRef.current = false;
      };

      recognition.onend = () => {
        setIsListening(false);
        if (shouldBeListeningRef.current && recognitionRef.current) {
          setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch {}
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition as unknown as SpeechRecognition;
    } else {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback((lang: string = 'en') => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = getSpeechRecognitionLanguageCode(lang);
      shouldBeListeningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch {}
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } catch {}
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    accumulatedTranscriptRef.current = '';
  }, []);

  return { isSupported, isListening, transcript, startListening, stopListening, clearTranscript };
}