'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface GoldPrice {
  name: string;
  bid: string | number;
  ask: string | number;
  diff: string | number;
}

interface GoldAsset {
  goldType: string;
  amount: string;
  purchasePrice: string;
}

interface RawGoldAsset {
  goldType: string;
  amount: string;
  purchasePrice: string;
  userId: number;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  goldType: string;
  amount: string;
  pricePerUnit: string;
  totalPrice: string;
  type: 'buy' | 'sell';
  createdAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface TransactionSummary {
  goldType: string;
  units: number;
  price: number;
  total: number;
  isSell?: boolean;
  averageCost: number;
  totalCost: number;
  previousAvgCost?: number;
  previousTotalCost?: number;
}

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [balance, setBalance] = useState(0);
  const [assets, setAssets] = useState<GoldAsset[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<GoldPrice | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [moneyAmount, setMoneyAmount] = useState('');
  const [sellUnits, setSellUnits] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [isBuyProcessing, setIsBuyProcessing] = useState(false);
  const [isSellProcessing, setIsSellProcessing] = useState(false);

  async function fetchData() {
    try {
      // Fetch user balance
      const balanceResponse = await fetch('/api/user/balance');
      const balanceData = await balanceResponse.json();
      setBalance(Number(balanceData.balance));

      // Fetch gold assets with proper typing
      const assetsResponse = await fetch('/api/gold-assets');
      const goldAssets: RawGoldAsset[] = await assetsResponse.json();
      
      // Convert to our asset format and combine same types
      const combinedAssets = goldAssets.reduce<Record<string, GoldAsset>>((acc, asset) => {
        const amount = Number(asset.amount);
        if (amount <= 0) return acc;
        
        if (!acc[asset.goldType]) {
          acc[asset.goldType] = {
            goldType: asset.goldType,
            amount: amount.toString(),
            purchasePrice: asset.purchasePrice
          };
        } else {
          const currentAmount = Number(acc[asset.goldType].amount);
          acc[asset.goldType].amount = (currentAmount + amount).toString();
        }
        return acc;
      }, {});
      
      setAssets(Object.values(combinedAssets));

      // Fetch gold prices with proper error handling
      const pricesResponse = await fetch('/api/gold');
      if (pricesResponse.ok) {
        const text = await pricesResponse.text(); // Get response as text first
        try {
          const pricesData = JSON.parse(text); // Then parse it as JSON
          setPrices(pricesData);
        } catch (parseError) {
          console.error('Error parsing gold prices:', parseError);
          console.log('Raw response:', text); // Log the raw response for debugging
        }
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPortfolioSummary = (goldType: string) => {
    const asset = assets.find(a => a.goldType === goldType);
    return {
      units: asset ? Number(asset.amount) : 0,
      value: asset ? Number(asset.amount) * Number(asset.purchasePrice) : 0
    };
  };

  const handleBuyClick = (price: GoldPrice) => {
    setSelectedPrice(price);
    setMoneyAmount('');
    setIsBuyDialogOpen(true);
  };

  const handleSellClick = (price: GoldPrice) => {
    setSelectedPrice(price);
    setSellUnits('');
    setIsSellDialogOpen(true);
  };

  const handleBuySubmit = async () => {
    if (!selectedPrice || !moneyAmount) return;

    const moneyNum = parseFloat(moneyAmount);
    
    if (moneyNum > balance) {
      toast.error('จำนวนเงินเกินยอดคงเหลือในบัญชี');
      return;
    }

    setIsBuyProcessing(true);

    try {
      const pricePerUnit = typeof selectedPrice.ask === 'string' ? 
        parseFloat(selectedPrice.ask) : selectedPrice.ask;
      
      const units = moneyNum / pricePerUnit;
      
      const goldType = selectedPrice.name === 'GoldSpot' ? 'GoldSpot' :
                      selectedPrice.name === '99.99%' ? 'ทอง 99.99%' :
                      selectedPrice.name === '96.5%' ? 'ทอง 96.5%' :
                      'ทองสมาคม';

      const response = await fetch('/api/transactions/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goldType,
          amount: units,
          pricePerUnit,
          totalPrice: moneyNum
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process purchase');
      }

      const data = await response.json();
      setBalance(data.balance);
      await fetchData();
      
      setTransactionSummary({
        goldType,
        units,
        price: pricePerUnit,
        total: moneyNum,
        averageCost: data.averageCost || 0,
        totalCost: data.totalCost || 0
      });
      
      setIsBuyDialogOpen(false);
      setShowSummaryDialog(true);
      toast.success('ซื้อทองสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการซื้อทอง');
    } finally {
      setIsBuyProcessing(false);
    }
  };

  const handleSellSubmit = async () => {
    if (!selectedPrice || !sellUnits) return;

    setIsSellProcessing(true);

    try {
      const units = parseFloat(sellUnits);
      const pricePerUnit = typeof selectedPrice.bid === 'string' ? 
        parseFloat(selectedPrice.bid) : selectedPrice.bid;
      const totalAmount = units * pricePerUnit;

      const goldType = selectedPrice.name === 'GoldSpot' ? 'GoldSpot' :
                      selectedPrice.name === '99.99%' ? 'ทอง 99.99%' :
                      selectedPrice.name === '96.5%' ? 'ทอง 96.5%' :
                      'ทองสมาคม';

      // Check if user has enough units to sell
      const currentAsset = assets.find(a => a.goldType === goldType);
      if (!currentAsset || Number(currentAsset.amount) < units) {
        toast.error('จำนวนทองไม่เพียงพอ');
        return;
      }

      const response = await fetch('/api/transactions/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goldType,
          amount: units,
          pricePerUnit,
          totalPrice: totalAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process sale');
      }

      const data = await response.json();
      setBalance(data.balance);
      await fetchData();

      setTransactionSummary({
        goldType,
        units,
        price: pricePerUnit,
        total: totalAmount,
        isSell: true,
        averageCost: data.averageCost || 0,
        totalCost: data.totalCost || 0,
        previousAvgCost: data.previousAvgCost,
        previousTotalCost: data.previousTotalCost
      });

      setIsSellDialogOpen(false);
      setShowSummaryDialog(true);
      toast.success('ขายทองสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการขายทอง');
    } finally {
      setIsSellProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600">
        <CardContent className="p-6">
          <div className="text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">เงินสดในพอร์ต</p>
                <p className="text-3xl font-bold">฿{balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-gray-600 text-sm -mt-2 mb-2">
        อัพเดทล่าสุด: {lastUpdate.toLocaleString('th-TH')}
      </div>

      {prices.map((price, index) => {
        const goldType = price.name === "สมาคมฯ" ? "ทองสมาคม" : 
                        price.name === "99.99%" ? "ทอง 99.99%" : 
                        price.name === "96.5%" ? "ทอง 96.5%" : 
                        price.name;
        const summary = getPortfolioSummary(goldType);

        return (
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
                    <h3 className="text-xl font-semibold text-gray-900">{goldType}</h3>
                    {price.name !== "THB" && (
                      <p className="text-sm text-gray-500">0.027 oz</p>
                    )}
                    {summary.units > 0.0001 && (
                      <p className="text-sm text-orange-600">
                        พอร์ต: {summary.units.toFixed(4)} บาท
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleBuyClick(price)}
                    className="bg-green-500 hover:bg-green-600 text-white h-8 w-16"
                    size="sm"
                  >
                    ซื้อ
                  </Button>
                  <Button
                    onClick={() => handleSellClick(price)}
                    className="bg-red-500 hover:bg-red-600 text-white h-8 w-16"
                    size="sm"
                  >
                    ขาย
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ราคารับซื้อ</p>
                  <p className="text-md font-semibold text-gray-900">
                    {price.name === "GoldSpot" ? 
                      `$${Number(price.bid).toLocaleString()}` : 
                      `${Number(price.bid).toLocaleString()} บาท`}
                  </p>
                </div>
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
        );
      })}

       {/* Buy Dialog */}
  <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>ซื้อทอง</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>จำนวนเงิน</Label>
          <Input
            type="number"
            value={moneyAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || Number(value) <= balance) {
                setMoneyAmount(value);
              }
            }}
            placeholder="ระบุจำนวนเงินที่ต้องการซื้อ"
          />
        </div>
        {moneyAmount && selectedPrice && (
          <div className="space-y-2">
            <Label>จำนวนทอง</Label>
            <p className="text-lg font-semibold">
              {(Number(moneyAmount) / Number(selectedPrice.ask)).toFixed(4)} หน่วย
            </p>
          </div>
        )}
        <Button
          onClick={handleBuySubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          disabled={!moneyAmount || Number(moneyAmount) <= 0 || Number(moneyAmount) > balance || isBuyProcessing}
        >
          {isBuyProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังทำรายการ...
            </>
          ) : (
            'ยืนยันคำสั่งซื้อ'
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>


      {/* Sell Dialog */}
  <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>ขายทอง</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {selectedPrice && (() => {
          const goldType = selectedPrice.name === "สมาคมฯ" ? "ทองสมาคม" : 
                          selectedPrice.name === "99.99%" ? "ทอง 99.99%" : 
                          selectedPrice.name === "96.5%" ? "ทอง 96.5%" : 
                          selectedPrice.name;
          const summary = getPortfolioSummary(goldType);
          return summary.units > 0.0001 ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">ทองในพอร์ต</p>
              <p className="text-lg font-semibold">{summary.units.toFixed(4)} หน่วย</p>
            </div>
          ) : null;
        })()}
        <div className="space-y-2">
          <Label>จำนวนหน่วยที่ต้องการขาย</Label>
          <Input
            type="number"
            value={sellUnits}
            onChange={(e) => {
              const value = e.target.value;
              if (selectedPrice) {
                const goldType = selectedPrice.name === "สมาคมฯ" ? "ทองสมาคม" : 
                                selectedPrice.name === "99.99%" ? "ทอง 99.99%" : 
                                selectedPrice.name === "96.5%" ? "ทอง 96.5%" : 
                                selectedPrice.name;
                const summary = getPortfolioSummary(goldType);
                if (value === '' || Number(value) <= summary.units) {
                  setSellUnits(value);
                }
              }
            }}
            placeholder="ระบุจำนวนหน่วยที่ต้องการขาย"
          />
          <Button
            type="button"
            onClick={() => {
              if (selectedPrice) {
                const goldType = selectedPrice.name === "สมาคมฯ" ? "ทองสมาคม" : 
                                selectedPrice.name === "99.99%" ? "ทอง 99.99%" : 
                                selectedPrice.name === "96.5%" ? "ทอง 96.5%" : 
                                selectedPrice.name;
                const summary = getPortfolioSummary(goldType);
                setSellUnits(summary.units.toString());
              }
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
          >
            ขายทั้งหมด
          </Button>
        </div>
        {sellUnits && selectedPrice && (
          <div className="space-y-2">
            <Label>จำนวนเงินที่จะได้รับ</Label>
            <p className="text-lg font-semibold text-green-600">
              ฿{(Number(sellUnits) * Number(selectedPrice.bid)).toLocaleString()}
            </p>
          </div>
        )}
        <Button
          onClick={handleSellSubmit}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          disabled={!sellUnits || Number(sellUnits) <= 0 || isSellProcessing}
        >
          {isSellProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังทำรายการ...
            </>
          ) : (
            'ยืนยันการขาย'
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionSummary?.isSell ? 'สรุปรายการขายทอง' : 'สรุปรายการซื้อทอง'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {transactionSummary && (
              <>
                <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
                  <div className="text-green-600 text-xl mb-2">✓ ทำรายการสำเร็จ</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประเภททอง</span>
                    <span className="font-medium">{transactionSummary.goldType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวนทอง</span>
                    <span className="font-medium">{transactionSummary.units.toFixed(4)} หน่วย</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคาต่อหน่วย</span>
                    <span className="font-medium">฿{transactionSummary.price.toLocaleString()}</span>
                  </div>

                  {transactionSummary.isSell && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ต้นทุนเฉลี่ยก่อนขาย</span>
                        <span className="font-medium">฿{transactionSummary.previousAvgCost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ต้นทุนรวมก่อนขาย</span>
                        <span className="font-medium">฿{transactionSummary.previousTotalCost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ต้นทุนเฉลี่ยหลังขาย</span>
                        <span className="font-medium">฿{transactionSummary.averageCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ต้นทุนรวมหลังขาย</span>
                        <span className="font-medium">฿{transactionSummary.totalCost.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{transactionSummary.isSell ? 'ได้รับเงิน' : 'ยอดชำระ'}</span>
                      <span className={transactionSummary.isSell ? 'text-green-600' : 'text-red-600'}>
                        ฿{transactionSummary.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowSummaryDialog(false)}
                  className="w-full mt-4"
                >
                  ปิด
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}