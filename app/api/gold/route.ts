import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://www.thaigold.info/RealTimeDataV2/gtdata_.txt', {
      next: { revalidate: 0 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gold prices');
    }

    const text = await response.text();
    const jsonStr = `[${text.split('[')[1].split(']')[0]}]`;
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold prices' },
      { status: 500 }
    );
  }
}