import { useCallback, useEffect, useRef, useState } from 'react';

// --- Configuration ---
// IMPORTANT: Replace with your actual CAMB.AI API key.
// It's strongly recommended to store this in an environment variable.
const CAMB_AI_API_KEY = 'f12b2538-9974-4c11-97f4-0c9d6f77f1dd';

// This is an example voice ID. You should get a list of available voices from CAMB.AI docs.
const CAMB_AI_VOICE_ID = 20305;

// This maps your app's language codes to CAMB.AI's language IDs.
// You must get the correct IDs from the CAMB.AI documentation or API.
const getCambLanguageId = (lang: string): number => {
  const languageIdMap: { [key: string]: number } = {
    'hi': 81, // Example ID for Hindi
    'pa': 148, // Example ID for Punjabi
    'mr': 101, // Example ID for Marathi
    'te': 129, // Example ID for Telugu
    'ta': 125, // Example ID for Tamil
  };
  return languageIdMap[lang] || 1; // Default to 1 (e.g., English)
};
// --- End Configuration ---


// Language code mapping for native browser speech synthesis
const getSpeechLanguageCode = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'pa': 'pa-IN',
    'mr': 'mr-IN',
    'te': 'te-IN',
    'ta': 'ta-IN'
  };
  return languageMap[lang] || 'en-US';
};

// --- Debug Helper Functions ---

/**
 * Simple language detection based on character sets
 * This is a basic implementation - for production, consider using a proper language detection library
 */
function detectLanguage(text: string): string {
  // Remove spaces and punctuation for analysis
  const cleanText = text.replace(/[\s\p{P}]/gu, '').toLowerCase();
  
  if (cleanText.length === 0) return 'en';
  
  // Hindi characters (Devanagari script)
  const hindiChars = cleanText.match(/[\u0900-\u097F]/g) || [];
  const hindiRatio = hindiChars.length / cleanText.length;
  
  // Punjabi characters (Gurmukhi script)
  const punjabiChars = cleanText.match(/[\u0A00-\u0A7F]/g) || [];
  const punjabiRatio = punjabiChars.length / cleanText.length;
  
  // Marathi characters (Devanagari script - same as Hindi)
  // We'll use the same detection as Hindi for now
  
  // Telugu characters (Telugu script)
  const teluguChars = cleanText.match(/[\u0C00-\u0C7F]/g) || [];
  const teluguRatio = teluguChars.length / cleanText.length;
  
  // Tamil characters (Tamil script)
  const tamilChars = cleanText.match(/[\u0B80-\u0BFF]/g) || [];
  const tamilRatio = tamilChars.length / cleanText.length;
  
  // Threshold for language detection (at least 30% of characters should be in the script)
  const threshold = 0.3;
  
  console.log('=== LANGUAGE DETECTION DEBUG ===');
  console.log('Clean text length:', cleanText.length);
  console.log('Hindi ratio:', hindiRatio);
  console.log('Punjabi ratio:', punjabiRatio);
  console.log('Telugu ratio:', teluguRatio);
  console.log('Tamil ratio:', tamilRatio);
  
  if (hindiRatio > threshold) {
    console.log('Detected language: Hindi');
    console.log('=== END LANGUAGE DETECTION DEBUG ===');
    return 'hi';
  } else if (punjabiRatio > threshold) {
    console.log('Detected language: Punjabi');
    console.log('=== END LANGUAGE DETECTION DEBUG ===');
    return 'pa';
  } else if (teluguRatio > threshold) {
    console.log('Detected language: Telugu');
    console.log('=== END LANGUAGE DETECTION DEBUG ===');
    return 'te';
  } else if (tamilRatio > threshold) {
    console.log('Detected language: Tamil');
    console.log('=== END LANGUAGE DETECTION DEBUG ===');
    return 'ta';
  }
  
  console.log('Detected language: English (default)');
  console.log('=== END LANGUAGE DETECTION DEBUG ===');
  return 'en';
}

/**
 * Debug function to check browser speech synthesis support
 */
function debugSpeechSynthesisSupport(): void {
  console.log('=== SPEECH SYNTHESIS DEBUG ===');
  console.log('Window object exists:', typeof window !== 'undefined');
  
  if (typeof window !== 'undefined') {
    console.log('SpeechSynthesis in window:', 'speechSynthesis' in window);
    console.log('SpeechSynthesisUtterance in window:', 'SpeechSynthesisUtterance' in window);
    
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      console.log('Speech synthesis available:', !!synth);
      console.log('Speech synthesis speaking:', synth.speaking);
      console.log('Speech synthesis paused:', synth.paused);
      console.log('Speech synthesis pending:', synth.pending);
      
      // Check available voices
      const voices = synth.getVoices();
      console.log('Available voices count:', voices.length);
      console.log('Available voices:', voices.map(v => ({
        name: v.name,
        lang: v.lang,
        default: v.default
      })));
    }
  }
  console.log('=== END SPEECH SYNTHESIS DEBUG ===');
}

/**
 * Debug function to validate CAMB.AI configuration
 */
function debugCambAIConfig(): void {
  console.log('=== CAMB.AI CONFIG DEBUG ===');
  console.log('API Key exists:', !!CAMB_AI_API_KEY);
  console.log('API Key length:', CAMB_AI_API_KEY?.length);
  console.log('Voice ID:', CAMB_AI_VOICE_ID);
  console.log('Language mappings:', {
    'hi': getCambLanguageId('hi'),
    'pa': getCambLanguageId('pa'),
    'mr': getCambLanguageId('mr'),
    'te': getCambLanguageId('te'),
    'ta': getCambLanguageId('ta')
  });
  console.log('=== END CAMB.AI CONFIG DEBUG ===');
}

// --- CAMB.AI API Functions ---

/**
 * 1. Creates a TTS task on CAMB.AI.
 */
async function createCambTTSTask(text: string, voiceId: number, languageId: number): Promise<string> {
  console.log('=== CREATING CAMB.AI TTS TASK ===');
  console.log('Text length:', text.length);
  console.log('Text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  console.log('Voice ID:', voiceId);
  console.log('Language ID:', languageId);
  
  const url = "https://client.camb.ai/apis/tts";
  const payload = {
    "text": text,
    "voice_id": voiceId,
    "language": languageId
  };
  const headers = {
    "x-api-key": CAMB_AI_API_KEY,
    "Content-Type": "application/json"
  };

  console.log('Request URL:', url);
  console.log('Request payload:', payload);
  console.log('Request headers:', { ...headers, "x-api-key": "***" });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error(`Failed to create TTS task: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    if (!data.task_id) {
      console.error('Missing task_id in response:', data);
      throw new Error("API response did not include a task_id.");
    }
    
    console.log('Task created successfully with ID:', data.task_id);
    console.log('=== END CREATING CAMB.AI TTS TASK ===');
    return data.task_id;
  } catch (error) {
    console.error('Error in createCambTTSTask:', error);
    throw error;
  }
}

/**
 * 2. Polls the status of the TTS task until it succeeds or fails.
 */
async function checkCambTaskStatus(taskId: string): Promise<number> {
  console.log('=== CHECKING CAMB.AI TASK STATUS ===');
  console.log('Task ID:', taskId);
  
  const url = `https://client.camb.ai/apis/tts/${taskId}`;
  const headers = { "x-api-key": CAMB_AI_API_KEY };
  
  let attempts = 0;
  const maxAttempts = 30; // 60 seconds max wait time

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Status check attempt ${attempts}/${maxAttempts}`);
    
    try {
      const response = await fetch(url, { headers });
      console.log('Status response status:', response.status);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Status check error:', errorBody);
        throw new Error(`Failed to check task status: ${response.status}`);
      }

      const statusData = await response.json();
      console.log('Status data:', statusData);

      if (statusData.status === 'SUCCESS') {
        if (!statusData.run_id) {
          console.error('Missing run_id in success response:', statusData);
          throw new Error("Task succeeded but did not return a run_id.");
        }
        console.log('Task completed successfully with run_id:', statusData.run_id);
        console.log('=== END CHECKING CAMB.AI TASK STATUS ===');
        return statusData.run_id;
      } else if (statusData.status === 'FAILED') {
        console.error('Task failed:', statusData);
        throw new Error('TTS task failed');
      } else {
        console.log(`Task still processing. Status: ${statusData.status}`);
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error in status check attempt ${attempts}:`, error);
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error(`Task status check timed out after ${maxAttempts} attempts`);
}

/**
 * 3. Downloads the final audio file.
 */
async function downloadCambAudio(runId: number): Promise<string> {
  console.log('=== DOWNLOADING CAMB.AI AUDIO ===');
  console.log('Run ID:', runId);
  
  const url = `https://client.camb.ai/apis/tts-result/${runId}`;
  const headers = { "x-api-key": CAMB_AI_API_KEY };

  console.log('Download URL:', url);

  try {
    const response = await fetch(url, { headers });
    console.log('Download response status:', response.status);
    console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Download error:', errorBody);
      throw new Error(`Failed to download audio: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);
    
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('Audio URL created:', audioUrl);
    console.log('=== END DOWNLOADING CAMB.AI AUDIO ===');
    return audioUrl;
  } catch (error) {
    console.error('Error in downloadCambAudio:', error);
    throw error;
  }
}


// --- React Hook ---

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    console.log('=== INITIALIZING TEXT-TO-SPEECH HOOK ===');
    debugSpeechSynthesisSupport();
    debugCambAIConfig();
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
      console.log('Speech synthesis initialized successfully');
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
    console.log('=== END INITIALIZING TEXT-TO-SPEECH HOOK ===');
  }, []);

  const stop = useCallback(() => {
    console.log('=== STOP FUNCTION CALLED ===');
    
    // Stop native speech synthesis
    if (synthRef.current) {
      synthRef.current.cancel();
      console.log('Native speech synthesis stopped');
    }
    
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('Audio playback stopped');
    }
    
    // Reset state
    setIsPlaying(false);
    setIsPaused(false);
    console.log('=== END STOP FUNCTION ===');
  }, []);

  const pause = useCallback(() => {
    console.log('=== PAUSE FUNCTION CALLED ===');
    
    // Pause native speech synthesis
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      setIsPaused(true);
      console.log('Native speech synthesis paused');
    }
    
    // Pause audio playback
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
      console.log('Audio playback paused');
    }
    
    console.log('=== END PAUSE FUNCTION ===');
  }, []);

  const resume = useCallback(() => {
    console.log('=== RESUME FUNCTION CALLED ===');
    
    // Resume native speech synthesis
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
      console.log('Native speech synthesis resumed');
    }
    
    // Resume audio playback
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
      console.log('Audio playback resumed');
    }
    
    console.log('=== END RESUME FUNCTION ===');
  }, []);

  const speak = useCallback(async (text: string, lang?: string) => {
    console.log('=== SPEAK FUNCTION CALLED ===');
    console.log('Text:', text);
    console.log('Provided language:', lang);
    
    // Stop any current playback first
    stop();
    
    // Check if text is valid
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('Invalid or empty text provided to speak function:', text);
      return;
    }
    
    console.log('Text length:', text.length);

    // If no language provided, detect it automatically
    const detectedLang = lang || detectLanguage(text);
    console.log('Final language to use:', detectedLang);
    console.log('Language detection was used:', !lang);

    // For English, use the fast, native browser synthesis
    if (detectedLang === 'en' && synthRef.current) {
      console.log('Using native browser speech synthesis for English');
      
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLanguageCode(detectedLang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Store reference to utterance for control
        utteranceRef.current = utterance;

        console.log('Utterance created:', {
          text: utterance.text,
          lang: utterance.lang,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume
        });

        // Add event listeners for debugging and state management
        utterance.onstart = () => {
          console.log('Speech started');
          setIsPlaying(true);
          setIsPaused(false);
        };
        utterance.onend = () => {
          console.log('Speech ended');
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onpause = () => {
          console.log('Speech paused');
          setIsPaused(true);
        };
        utterance.onresume = () => {
          console.log('Speech resumed');
          setIsPaused(false);
        };

        synthRef.current.speak(utterance);
        console.log('Speech synthesis initiated');
      } catch (error) {
        console.error('Error with native speech synthesis:', error);
        setIsPlaying(false);
        setIsPaused(false);
      }
      return;
    }

    // For other languages, use the CAMB.AI service
    console.log('Using CAMB.AI service for non-English language');
    try {
      console.log("Initiating CAMB.AI TTS...");
      const taskId = await createCambTTSTask(text, CAMB_AI_VOICE_ID, getCambLanguageId(detectedLang));
      console.log(`Task created with ID: ${taskId}`);
      const runId = await checkCambTaskStatus(taskId);
      console.log(`Task successful, Run ID: ${runId}`);
      const audioUrl = await downloadCambAudio(runId);
      console.log(`Audio downloaded: ${audioUrl}`);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Add event listeners for debugging and state management
      audio.onloadstart = () => console.log('Audio loading started');
      audio.oncanplay = () => console.log('Audio can play');
      audio.onplay = () => {
        console.log('Audio playback started');
        setIsPlaying(true);
        setIsPaused(false);
      };
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        setIsPaused(false);
      };
      audio.onerror = (error) => {
        console.error('Audio error:', error);
        setIsPlaying(false);
        setIsPaused(false);
      };
      audio.onpause = () => {
        console.log('Audio paused');
        setIsPaused(true);
      };
      
      console.log('Playing audio...');
      await audio.play();
      console.log('Audio play command executed');
    } catch (error) {
      console.error("Error with CAMB.AI TTS:", error);
      setIsPlaying(false);
      setIsPaused(false);
      
      // Provide detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Optional: Add a fallback or user notification here
      console.log('Consider implementing fallback TTS or user notification');
    }
    
    console.log('=== END SPEAK FUNCTION ===');
  }, [stop]);

  return { 
    isSupported, 
    speak, 
    stop, 
    pause, 
    resume, 
    isPlaying, 
    isPaused 
  };
}