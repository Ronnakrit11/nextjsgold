import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching at the route level
export const fetchCache = 'force-no-store'; // Disable fetch caching
export const revalidate = 0; // Disable revalidation

export async function GET() {
  try {
    const response = await fetch('http://www.thaigold.info/RealTimeDataV2/gtdata_.txt', {
      cache: 'no-store', // Disable caching at the fetch level
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gold prices');
    }

    const text = await response.text();
    const jsonStr = `[${text.split('[')[1].split(']')[0]}]`;
    const data = JSON.parse(jsonStr);

    // Filter out unwanted gold types
    const filteredData = data.filter((item: any) => {
      const unwantedTypes = [
        'GFG25', 'GFJ25', 'GFM25', 'SVG25', 'SVJ25', 'SVM25',
        'GFPTM23-curr', 'GF10M23-curr', 'GF10Q23-curr', 'GF10V23-curr',
        'GFM23-curr', 'GFQ23-curr', 'GFV23-curr', 'SVFM23-curr', 'SVFU23-curr','Update'
      ];
      return !unwantedTypes.includes(item.name);
    });

    return new NextResponse(JSON.stringify(filteredData), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold prices' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}