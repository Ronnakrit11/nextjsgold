'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { pusherClient } from '@/lib/pusher';

interface GoldPrice {
  name: string;
  bid: string | number;
  ask: string | number;
  diff: string | number;
}

export function GoldPricesHome() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    async function fetchPrices() {
      try {
        const response = await fetch('/api/gold');
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        }
      } catch (error) {
        console.error('Error fetching gold prices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();

    // Subscribe to Pusher channel
    try {
      const channel = pusherClient.subscribe('gold-prices');
      channel.bind('price-update', (data: GoldPrice[]) => {
        setPrices(data);
      });

      // Cleanup
      return () => {
        channel.unbind('price-update');
        pusherClient.unsubscribe('gold-prices');
      };
    } catch (error) {
      console.error('Pusher subscription error:', error);
    }
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading prices...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {prices.map((price, index) => {
        const displayName = price.name === "สมาคมฯ" ? "ทองสมาคม" : 
                          price.name === "99.99%" ? "ทอง 99.99%" : 
                          price.name === "96.5%" ? "ทอง 96.5%" : 
                          "Gold Spot";

        return (
          <Card key={index} className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{displayName}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคารับซื้อ</span>
                  <span className="font-medium">
                    {price.name === "GoldSpot" ? 
                      `$${Number(price.bid).toLocaleString()}` : 
                      `${Number(price.bid).toLocaleString()} บาท`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาขายออก</span>
                  <span className="font-medium">
                    {price.name === "GoldSpot" ? 
                      `$${Number(price.ask).toLocaleString()}` : 
                      `${Number(price.ask).toLocaleString()} บาท`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">เปลี่ยนแปลง</span>
                  <span className={`font-medium ${Number(price.diff) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(price.diff).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}