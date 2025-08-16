import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the FormData from the request
    const formData = await req.formData();
    
    // Validate required fields
    const query = formData.get('query');
    if (!query) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    // Prepare the request to the backend
    const backendUrl = 'http://localhost:8000/api/query';
    
    // Forward the FormData directly to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ message: 'Backend service error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Query API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
