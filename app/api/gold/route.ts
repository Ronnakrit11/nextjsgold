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
    const cachedPrices = await redis.get(CACHE_KEYS.GOLD_PRICES);
    if (cachedPrices) {
      return new NextResponse(JSON.stringify(cachedPrices), {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Try to get cached markup settings
    let settings = await redis.get<MarkupSetting>(CACHE_KEYS.MARKUP_SETTINGS);
    
    if (!settings) {
      // If not cached, fetch from database
      [settings] = await db
        .select()
        .from(markupSettings)
        .orderBy(markupSettings.id)
        .limit(1);
        
      if (settings) {
        // Cache markup settings
        await redis.set(CACHE_KEYS.MARKUP_SETTINGS, settings, {
          ex: CACHE_TTL.MARKUP_SETTINGS
        });
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

    // Cache the processed data
    await redis.set(CACHE_KEYS.GOLD_PRICES, processedData, {
      ex: CACHE_TTL.GOLD_PRICES
    });

    return new NextResponse(JSON.stringify(processedData), {
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