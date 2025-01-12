'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoldPrice {
  name: string;
  bid: string | number;
  ask: string | number;
  diff: string | number;
}

interface MarkupSettings {
  goldSpot: number;
  gold9999: number;
  gold965: number;
  goldAssociation: number;
  goldSpotAsk: number;
  gold9999Ask: number;
  gold965Ask: number;
  goldAssociationAsk: number;
}

const getStoredMarkup = (): MarkupSettings => {
  if (typeof window === 'undefined') return {
    goldSpot: 0,
    gold9999: 0,
    gold965: 0,
    goldAssociation: 0,
    goldSpotAsk: 0,
    gold9999Ask: 0,
    gold965Ask: 0,
    goldAssociationAsk: 0,
  };
  
  const stored = localStorage.getItem('markupSettings');
  return stored ? JSON.parse(stored) : {
    goldSpot: 0,
    gold9999: 0,
    gold965: 0,
    goldAssociation: 0,
    goldSpotAsk: 0,
    gold9999Ask: 0,
    gold965Ask: 0,
    goldAssociationAsk: 0,
  };
};

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>(getStoredMarkup());

  // Add a function to listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMarkupSettings(getStoredMarkup());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    async function fetchGoldPrices() {
      try {
        const response = await fetch('/api/gold');
        if (!response.ok) {
          throw new Error('Failed to fetch gold prices');
        }
        const data = await response.json();
        
        // Apply markups to the prices
        const pricesWithMarkup = data.map((price: GoldPrice) => {
          let bidMarkup = 0;
          let askMarkup = 0;
          
          switch(price.name) {
            case 'GoldSpot':
              bidMarkup = markupSettings.goldSpot;
              askMarkup = markupSettings.goldSpotAsk;
              break;
            case '99.99%':
              bidMarkup = markupSettings.gold9999;
              askMarkup = markupSettings.gold9999Ask;
              break;
            case '96.5%':
              bidMarkup = markupSettings.gold965;
              askMarkup = markupSettings.gold965Ask;
              break;
            case 'สมาคมฯ':
              bidMarkup = markupSettings.goldAssociation;
              askMarkup = markupSettings.goldAssociationAsk;
              break;
          }
          
          // Convert bid and ask to numbers before applying markup
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

        setPrices(pricesWithMarkup);
        setError(null);
      } catch (err) {
        setError('Failed to fetch gold prices');
        console.error('Error fetching gold prices:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGoldPrices();
    // Fetch every 5 minutes
    const interval = setInterval(fetchGoldPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [markupSettings]); // Add markupSettings as a dependency

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading gold prices...</div>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-6 w-6 text-orange-500" />
          <span>Current Gold Prices</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prices.map((price, index) => (
            price.name !== "Update" && (
            <div
              key={index}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">
                  {price.name === "สมาคมฯ" ? "ทองสมาคม" : price.name === "99.99%" ? "ทอง 99.99%" : price.name === "96.5%" ? "ทอง 96.5%" : price.name}
                </h3>
                {price.diff !== "" && (
                  <span
                    className={`text-sm font-medium ${
                      Number(price.diff) > 0
                        ? 'text-green-600'
                        : Number(price.diff) < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {Number(price.diff) > 0 ? '+' : ''}
                    {price.diff}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {price.name === "GoldSpot" ? `${Number(price.bid).toLocaleString()} USD` : `${Number(price.bid).toLocaleString()} บาท`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ask</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {price.name === "GoldSpot" ? `${Number(price.ask).toLocaleString()} USD` : `${Number(price.ask).toLocaleString()} บาท`}
                  </p>
                </div>
                <div className="col-span-2 mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => console.log('Buy', price.name)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    ซื้อ
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => console.log('Sell', price.name)}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    ขาย
                  </Button>
                </div>
              </div>
            </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}