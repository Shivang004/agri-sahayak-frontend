export const translateText = async (text: string, fromLang: string, toLang: string) => {
  if (fromLang === toLang) return text;
  
  try {
    const from = fromLang.split('-')[0];
    const to = toLang.split('-')[0];
    
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    
    if (!response.ok) {
      throw new Error('Translation API request failed');
    }
    
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text on error
  }
};
