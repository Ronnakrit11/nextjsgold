import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { markupSettings } from '@/lib/db/schema';
import { pusherServer } from '@/lib/pusher';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch markup settings
    const [settings] = await db
      .select()
      .from(markupSettings)
      .orderBy(markupSettings.id)
      .limit(1);

    const response = await fetch('http://www.thaigold.info/RealTimeDataV2/gtdata_.txt', {
      cache: 'no-store',
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

    // Apply markup percentages if settings exist
    let finalData;
    if (settings) {
      finalData = filteredData.map((item: any) => {
        switch (item.name) {
          case 'GoldSpot':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.goldSpotBid) / 100),
              ask: Number(item.ask) * (1 + Number(settings.goldSpotAsk) / 100)
            };
          case '99.99%':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.gold9999Bid) / 100),
              ask: Number(item.ask) * (1 + Number(settings.gold9999Ask) / 100)
            };
          case '96.5%':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.gold965Bid) / 100),
              ask: Number(item.ask) * (1 + Number(settings.gold965Ask) / 100)
            };
          case 'สมาคมฯ':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.goldAssociationBid) / 100),
              ask: Number(item.ask) * (1 + Number(settings.goldAssociationAsk) / 100)
            };
          default:
            return item;
        }
      });
    } else {
      finalData = filteredData;
    }

    // Trigger Pusher event with the new prices
    await pusherServer.trigger('gold-prices', 'price-update', finalData);

    return new NextResponse(JSON.stringify(finalData), {
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