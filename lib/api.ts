export type QueryRequestBody = {
  query: string;
  imageUrl?: string | null;
  language: string;
  latitude: number;
  longitude: number;
  state_id: number;
  district_id: number[];
};

export type QueryResponse = {
  response: string;
  agents_used?: string[];
  mode?: string;
  query_en?: string;
};

export async function postQuery(body: QueryRequestBody): Promise<QueryResponse> {
  // Create FormData instead of JSON
  const formData = new FormData();
  
  // Add text data
  formData.append('query', body.query);
  formData.append('language', body.language);
  formData.append('latitude', body.latitude.toString());
  formData.append('longitude', body.longitude.toString());
  formData.append('state_id', body.state_id.toString());
  formData.append('district_id', JSON.stringify(body.district_id));

  // Add image if provided
  if (body.imageUrl) {
    try {
      // Convert base64 or URL to blob
      let imageBlob: Blob;
      if (body.imageUrl.startsWith('data:')) {
        // Handle base64 image
        const response = await fetch(body.imageUrl);
        imageBlob = await response.blob();
      } else if (body.imageUrl.startsWith('http')) {
        // Handle URL
        const response = await fetch(body.imageUrl);
        imageBlob = await response.blob();
      } else {
        // Handle file path (for local files)
        const response = await fetch(body.imageUrl);
        imageBlob = await response.blob();
      }
      formData.append('image', imageBlob, 'image.jpg');
    } catch (error) {
      console.error('Error processing image:', error);
      // Continue without image if there's an error
    }
  }

  const response = await fetch('/api/query', {
    method: 'POST',
    body: formData // Send as FormData, not JSON
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  return response.json();
}

