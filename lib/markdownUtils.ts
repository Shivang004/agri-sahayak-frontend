/**
 * Utility functions to convert markdown text to beautiful HTML
 */

export function convertMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Convert headers (## and ###)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
  
  // Convert bold text (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  
  // Convert italic text (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
  
  // Convert bullet points (* item)
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>');
  
  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li.*?<\/li>)/gs, '<ul class="list-disc space-y-1 my-3">$1</ul>');
  
  // Convert numbered lists (1. item)
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>');
  
  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');
  
  // Convert paragraphs (double line breaks)
  html = html.replace(/<br><br>/g, '</p><p class="mb-3 text-gray-700">');
  
  // Wrap the entire content in a paragraph if it's not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<li')) {
    html = `<p class="mb-3 text-gray-700">${html}</p>`;
  }
  
  // Clean up any empty paragraphs
  html = html.replace(/<p class="mb-3 text-gray-700"><\/p>/g, '');
  
  return html;
}

/**
 * Enhanced version that handles more complex markdown patterns
 */
export function convertAdvancedMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Split into sections based on double line breaks
  const sections = html.split(/\n\n+/);
  
  const processedSections = sections.map(section => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return '';
    
    // Check if it's a header
    if (trimmedSection.startsWith('### ')) {
      return trimmedSection.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
    }
    
    if (trimmedSection.startsWith('## ')) {
      return trimmedSection.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
    }
    
    if (trimmedSection.startsWith('# ')) {
      return trimmedSection.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
    }
    
    // Check if it's a list
    const lines = trimmedSection.split('\n');
    const isList = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- ') || /^\d+\./.test(line.trim()));
    
    if (isList) {
      const listItems = lines.map(line => {
        const item = line.trim().replace(/^[\*\-] (.*$)/gim, '$1').replace(/^\d+\. (.*$)/gim, '$1');
        return `<li class="ml-4 mb-1 text-gray-700">${convertInlineMarkdown(item)}</li>`;
      }).join('');
      
      return `<ul class="list-disc space-y-1 my-3">${listItems}</ul>`;
    }
    
    // Regular paragraph
    return `<p class="mb-3 text-gray-700">${convertInlineMarkdown(trimmedSection)}</p>`;
  });
  
  return processedSections.filter(section => section).join('');
}

/**
 * Convert inline markdown elements (bold, italic, etc.)
 */
function convertInlineMarkdown(text: string): string {
  let html = text;
  
  // Convert bold text (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  
  // Convert italic text (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
  
  // Convert code snippets (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  return html;
}

/**
 * Main function to use - combines both approaches for best results
 */
export function formatChatMessage(text: string): string {
  if (!text) return '';
  
  // First try the advanced conversion
  let html = convertAdvancedMarkdownToHtml(text);
  
  // If the result is too simple, try the basic conversion
  if (html === text || html.length < text.length * 0.8) {
    html = convertMarkdownToHtml(text);
  }
  
  return html;
}
