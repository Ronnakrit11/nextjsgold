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

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoldPrices() {
      try {
        const response = await fetch('/api/gold');
        if (!response.ok) {
          throw new Error('Failed to fetch gold prices');
        }
        const data = await response.json();
        setPrices(data);
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
  }, []);

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
                    {price.name === "GoldSpot" ? `${price.bid.toLocaleString()} USD` : `${price.bid.toLocaleString()} บาท`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ask</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {price.name === "GoldSpot" ? `${price.ask.toLocaleString()} USD` : `${price.ask.toLocaleString()} บาท`}
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