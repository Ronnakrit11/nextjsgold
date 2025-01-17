'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Wallet, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AssetSkeleton } from '@/components/AssetSkeleton';

interface GoldAsset {
  goldType: string;
  amount: string;
  purchasePrice: string;
  totalCost: string;
  averageCost: string;
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

        // Fetch gold assets directly from gold_assets table
        const assetsResponse = await fetch('/api/gold-assets');
        const goldAssets = await assetsResponse.json();
        
        // Combine assets of the same type and calculate weighted average purchase price
        const combinedAssets = goldAssets.reduce((acc: { [key: string]: any }, asset: any) => {
          const amount = Number(asset.amount);
          if (amount <= 0.0001) return acc;

          if (!acc[asset.goldType]) {
            acc[asset.goldType] = {
              goldType: asset.goldType,
              amount: amount,
              totalValue: amount * Number(asset.purchasePrice),
              purchasePrice: Number(asset.purchasePrice)
            };
          } else {
            acc[asset.goldType].amount += amount;
            acc[asset.goldType].totalValue += amount * Number(asset.purchasePrice);
          }
          return acc;
        }, {});

        // Convert combined assets to array format with average purchase price
        const formattedAssets = Object.values(combinedAssets).map((asset: any) => ({
          goldType: asset.goldType,
          amount: asset.amount.toString(),
          purchasePrice: (asset.totalValue / asset.amount).toString(),
          totalCost: asset.totalValue.toString(),
          averageCost: (asset.totalValue / asset.amount).toString()
        }));

        setAssets(formattedAssets);

        // Fetch gold prices
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

  const totalAssetValue = calculateTotalValue();
  const totalAccountValue = totalAssetValue + balance;

  if (loading) {
    return <AssetSkeleton />;
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Asset Overview
      </h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-orange-500" />
              <span className='text-sm'>Account Value</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-xl font-bold text-orange-500">
                  {totalAccountValue.toLocaleString()} ฿
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  มูลค่ารวมในพอร์ต
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-orange-500" />
              <span className='text-sm'>เงินสดในพอร์ต</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <p className="text-xl font-bold text-orange-500">
                {balance.toLocaleString()} ฿
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Available Balance
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6 text-orange-500" />
              <span className='text-sm'>Asset Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <p className="text-xl font-bold text-orange-500">
                {totalAssetValue.toLocaleString()} ฿
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
                const purchaseValue = Number(asset.totalCost);
                const avgCost = Number(asset.averageCost);
                const profitLoss = currentValue - purchaseValue;
                const profitLossPercentage = purchaseValue !== 0 ? 
                  (profitLoss / purchaseValue) * 100 : 0;

                return (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-0">
                      <div>
                        <h3 className="font-medium text-lg">{asset.goldType}</h3>
                        <p className="text-sm text-gray-500">
                          {Number(asset.amount).toFixed(4)} บาท
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium mb-1">฿{currentValue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          ราคารับซื้อ: ฿{buybackPrice.toLocaleString()}
                        </p>
                        <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()} 
                          ({profitLossPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-[13px] pt-0">
                      <div>
                        <p className="text-gray-500">
                          ต้นทุนเฉลี่ย: ฿{avgCost.toLocaleString()}
                        </p>
                        <p className="text-gray-500">
                          ต้นทุนรวม: ฿{purchaseValue.toLocaleString()}
                        </p>
                      </div>
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