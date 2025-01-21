import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { markupSettings, type MarkupSetting } from '@/lib/db/schema';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    // Try to get cached gold prices
    const cachedPrices: string | null = await redis.get(CACHE_KEYS.GOLD_PRICES);
    if (cachedPrices) {
      console.log('Cache hit: Returning cached gold prices');
      return new NextResponse(cachedPrices, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    console.log('Cache miss: Fetching fresh gold prices');

    // Try to get cached markup settings
    let settings: MarkupSetting | null = null;
    const cachedSettings: string | null = await redis.get(CACHE_KEYS.MARKUP_SETTINGS);
    
    if (cachedSettings) {
      console.log('Cache hit: Using cached markup settings');
      settings = JSON.parse(cachedSettings) as MarkupSetting;
    } else {
      console.log('Cache miss: Fetching markup settings from database');
      const dbSettings = await db
        .select()
        .from(markupSettings)
        .orderBy(markupSettings.id)
        .limit(1);
        
      if (dbSettings.length > 0) {
        settings = dbSettings[0];
        // Cache markup settings
        await redis.set(
          CACHE_KEYS.MARKUP_SETTINGS, 
          JSON.stringify(settings), 
          { ex: CACHE_TTL.MARKUP_SETTINGS }
        );
      }
    }

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
    const processedData = settings ? 
      filteredData.map((item: any) => {
        switch (item.name) {
          case 'GoldSpot':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.goldSpotBid || 0) / 100),
              ask: Number(item.ask) * (1 + Number(settings.goldSpotAsk || 0) / 100)
            };
          case '99.99%':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.gold9999Bid || 0) / 100),
              ask: Number(item.ask) * (1 + Number(settings.gold9999Ask || 0) / 100)
            };
          case '96.5%':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.gold965Bid || 0) / 100),
              ask: Number(item.ask) * (1 + Number(settings.gold965Ask || 0) / 100)
            };
          case 'สมาคมฯ':
            return {
              ...item,
              bid: Number(item.bid) * (1 + Number(settings.goldAssociationBid || 0) / 100),
              ask: Number(item.ask) * (1 + Number(settings.goldAssociationAsk || 0) / 100)
            };
          default:
            return item;
        }
      }) : filteredData;

    const processedDataString = JSON.stringify(processedData);

    // Cache the processed data
    await redis.set(
      CACHE_KEYS.GOLD_PRICES, 
      processedDataString, 
      { ex: CACHE_TTL.GOLD_PRICES }
    );

    return new NextResponse(processedDataString, {
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