'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GoldAsset {
  goldType: string;
  amount: string;
  purchasePrice: string;
}

interface GoldPrice {
  name: string;
  bid: string | number;
  ask: string | number;
  diff: string | number;
}

export default function AssetPage() {
  const [balance, setBalance] = useState(0);
  const [assets, setAssets] = useState<GoldAsset[]>([]);
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user balance
        const balanceResponse = await fetch('/api/user/balance');
        const balanceData = await balanceResponse.json();
        setBalance(Number(balanceData.balance));

        // Fetch gold assets
        const assetsResponse = await fetch('/api/transactions/history');
        const assetsData = await assetsResponse.json();
        setAssets(assetsData);

        // Fetch current gold prices
        const pricesResponse = await fetch('/api/gold');
        const pricesData = await pricesResponse.json();
        setPrices(pricesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getBuybackPrice = (goldType: string) => {
    const priceMap: Record<string, string> = {
      'ทองสมาคม': 'สมาคมฯ',
      'ทอง 99.99%': '99.99%',
      'ทอง 96.5%': '96.5%'
    };
    
    const price = prices.find(p => p.name === priceMap[goldType]);
    return price ? Number(price.bid) : 0;
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const buybackPrice = getBuybackPrice(asset.goldType);
      return total + (Number(asset.amount) * buybackPrice);
    }, 0);
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="text-center">Loading...</div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Asset Overview
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-orange-500" />
              <span>Your Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <p className="text-3xl font-bold text-orange-500">
                ฿{balance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Available Balance
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6 text-orange-500" />
              <span>Asset Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <p className="text-3xl font-bold text-orange-500">
                ฿{calculateTotalValue().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Asset Value (at current buy-back prices)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Asset Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <div className="space-y-4">
              {assets.map((asset, index) => {
                const buybackPrice = getBuybackPrice(asset.goldType);
                const currentValue = Number(asset.amount) * buybackPrice;
                const purchaseValue = Number(asset.amount) * Number(asset.purchasePrice);
                const profitLoss = currentValue - purchaseValue;
                const profitLossPercentage = (profitLoss / purchaseValue) * 100;

                return (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{asset.goldType}</h3>
                        <p className="text-sm text-gray-500">
                          {Number(asset.amount).toFixed(4)} หน่วย
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">฿{currentValue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          ราคารับซื้อ: ฿{buybackPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ต้นทุน: ฿{purchaseValue.toLocaleString()}</span>
                      <span className={profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()} 
                        ({profitLossPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You don't have any gold assets yet
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}