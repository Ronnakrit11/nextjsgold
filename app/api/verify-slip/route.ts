import { NextResponse } from 'next/server';

const API_URL = 'https://suba.rdcw.co.th/v1/inquiry';
const CLIENT_ID = process.env.RDCW_CLIENT_ID;
const CLIENT_SECRET = process.env.RDCW_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('RDCW credentials not configured');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('slip') as File;
    const amount = formData.get('amount');

    if (!file || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Create payload for the API
    const payload = {
      payload: base64
    };

    // Basic auth credentials
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Verification failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Process the verification result
    const result = {
      verified: data.status === 'success',
      message: data.message || 'Verification completed',
      data: data
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying slip:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}