'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface GoldPrice {
  name: string;
  bid: string | number;
  ask: string | number;
  diff: string | number;
}

interface MarkupSettings {
  gold_spot_bid: number;
  gold_spot_ask: number;
  gold_9999_bid: number;
  gold_9999_ask: number;
  gold_965_bid: number;
  gold_965_ask: number;
  gold_association_bid: number;
  gold_association_ask: number;
}

const defaultMarkupSettings: MarkupSettings = {
  gold_spot_bid: 0,
  gold_spot_ask: 0,
  gold_9999_bid: 0,
  gold_9999_ask: 0,
  gold_965_bid: 0,
  gold_965_ask: 0,
  gold_association_bid: 0,
  gold_association_ask: 0,
};

const allowedItems = [
  'GoldSpot',
  'Silver',
  'THB',
  'สมาคมฯ',
  '96.5%',
  '99.99%'
];

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>(defaultMarkupSettings);
  const [markupLoading, setMarkupLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchMarkupSettings() {
      try {
        const response = await fetch('/api/markup');
        if (!response.ok) {
          throw new Error('Failed to fetch markup settings');
        }
        const data = await response.json();
        setMarkupSettings(data);
      } catch (err) {
        console.error('Error fetching markup settings:', err);
        setMarkupSettings(defaultMarkupSettings);
      } finally {
        setMarkupLoading(false);
      }
    }

    fetchMarkupSettings();
  }, []);

  useEffect(() => {
    async function fetchGoldPrices() {
      setUpdating(true);
      try {
        const response = await fetch('/api/gold');
        if (!response.ok) {
          throw new Error('Failed to fetch gold prices');
        }
        const data = await response.json();
        
        const filteredPrices = data
          .filter((price: GoldPrice) => allowedItems.includes(price.name))
          .map((price: GoldPrice) => {
            let bidMarkup = 0;
            let askMarkup = 0;
            
            switch(price.name) {
              case 'GoldSpot':
                bidMarkup = markupSettings.gold_spot_bid;
                askMarkup = markupSettings.gold_spot_ask;
                break;
              case '99.99%':
                bidMarkup = markupSettings.gold_9999_bid;
                askMarkup = markupSettings.gold_9999_ask;
                break;
              case '96.5%':
                bidMarkup = markupSettings.gold_965_bid;
                askMarkup = markupSettings.gold_965_ask;
                break;
              case 'สมาคมฯ':
                bidMarkup = markupSettings.gold_association_bid;
                askMarkup = markupSettings.gold_association_ask;
                break;
            }
            
            const numericBid = typeof price.bid === 'string' ? parseFloat(price.bid) : price.bid;
            const numericAsk = typeof price.ask === 'string' ? parseFloat(price.ask) : price.ask;
            
            return {
              ...price,
              bid: typeof numericBid === 'number' ? 
                numericBid * (1 + bidMarkup / 100) : numericBid,
              ask: typeof numericAsk === 'number' ? 
                numericAsk * (1 + askMarkup / 100) : numericAsk,
            };
          });

        setPrices(filteredPrices);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch gold prices');
        console.error('Error fetching gold prices:', err);
      } finally {
        setLoading(false);
        setUpdating(false);
      }
    }

    if (!markupLoading) {
      fetchGoldPrices();
      // Update every 10 seconds
      const interval = setInterval(fetchGoldPrices, 10000);
      return () => clearInterval(interval);
    }
  }, [markupSettings, markupLoading]);

  if (loading || markupLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading gold prices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
        {updating && (
          <div className="flex items-center text-sm text-orange-500">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            Updating...
          </div>
        )}
      </div>
      {prices.map((price, index) => (
        <Card key={index} className="bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Image
                    src="/gold.png"
                    alt="Gold"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {price.name === "สมาคมฯ" ? "ทองสมาคม" : 
                     price.name === "99.99%" ? "ทอง 99.99%" : 
                     price.name === "96.5%" ? "ทอง 96.5%" : 
                     price.name}
                  </h3>
                  {price.name !== "THB" && (
                    <p className="text-sm text-gray-500">0.027 oz</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">รับซื้อ
                  <br />
                   {price.name === "GoldSpot" ? 
                    `$${Number(price.bid).toLocaleString()}` : 
                    `${Number(price.bid).toLocaleString()} บาท`}
                </p>
                <p className={`text-sm ${Number(price.diff) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(price.diff) > 0 ? '+' : ''}{Number(price.diff).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ราคาขายออก</p>
                <p className="text-md font-semibold text-gray-900">
                  {price.name === "GoldSpot" ? 
                    `$${Number(price.ask).toLocaleString()}` : 
                    `${Number(price.ask).toLocaleString()} บาท`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Change</p>
                <p className={`text-lg font-semibold ${Number(price.diff) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(price.diff).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}