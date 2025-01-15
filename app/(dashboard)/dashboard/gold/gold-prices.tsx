'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { toast } from 'sonner';

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

interface Transaction {
  goldType: string;
  amount: string;
  pricePerUnit: string;
  totalPrice: string;
  type: 'buy' | 'sell';
  createdAt: string;
}

interface TransactionSummary {
  goldType: string;
  units: number;
  price: number;
  total: number;
  isSell?: boolean;
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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const getPortfolioSummary = (goldType: string) => {
    const asset = assets.find(a => a.goldType === goldType);
    return {
      units: asset ? Number(asset.amount) : 0,
      value: asset ? Number(asset.amount) * Number(asset.purchasePrice) : 0
    };
  };

  async function fetchData() {
    try {
      // Fetch user balance
      const balanceResponse = await fetch('/api/user/balance');
      const balanceData = await balanceResponse.json();
      setBalance(Number(balanceData.balance));

      // Fetch gold assets
      const assetsResponse = await fetch('/api/transactions/history');
      const transactions = (await assetsResponse.json()) as Transaction[];
      
      // Process transactions to calculate current holdings
      const holdings = transactions.reduce((acc: Record<string, { amount: number, totalCost: number }>, curr: Transaction) => {
        const goldType = curr.goldType;
        if (!acc[goldType]) {
          acc[goldType] = { amount: 0, totalCost: 0 };
        }
        
        if (curr.type === 'buy') {
          acc[goldType].amount += Number(curr.amount);
          acc[goldType].totalCost += Number(curr.totalPrice);
        } else if (curr.type === 'sell') {
          acc[goldType].amount -= Number(curr.amount);
          // For sells, reduce cost basis proportionally
          const costPerUnit = acc[goldType].totalCost / (acc[goldType].amount + Number(curr.amount));
          acc[goldType].totalCost -= costPerUnit * Number(curr.amount);
        }
        
        return acc;
      }, {});

      // Convert holdings to assets format
      const combinedAssets = Object.entries(holdings)
        .filter(([_, data]) => data.amount > 0) // Only include assets with positive amounts
        .map(([goldType, data]) => ({
          goldType,
          amount: data.amount.toString(),
          purchasePrice: (data.amount > 0 ? data.totalCost / data.amount : 0).toString()
        }));

      setAssets(combinedAssets);

      // Fetch gold prices
      const pricesResponse = await fetch('/api/gold');
      const pricesData = await pricesResponse.json();
      setPrices(pricesData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Set up polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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
      await fetchData(); // Refresh assets
      
      setTransactionSummary({
        goldType,
        units,
        price: pricePerUnit,
        total: moneyNum
      });
      
      setIsBuyDialogOpen(false);
      setShowSummaryDialog(true);
      toast.success('ซื้อทองสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการซื้อทอง');
    }
  };

  const handleSellSubmit = async () => {
    if (!selectedPrice || !sellUnits) return;

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
      await fetchData(); // Refresh assets

      setTransactionSummary({
        goldType,
        units,
        price: pricePerUnit,
        total: totalAmount,
        isSell: true
      });

      setIsSellDialogOpen(false);
      setShowSummaryDialog(true);
      toast.success('ขายทองสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการขายทอง');
    }
  };

  return (
    <div className="space-y-4">
      {/* Balance Display */}
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

      {/* Last Update Time Display */}
      <div className="text-center text-gray-600 text-sm -mt-2 mb-2">
        อัพเดทล่าสุด: {formatDateTime(lastUpdate)}
      </div>

      {/* Gold Price Cards */}
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
                  {(() => {
                    const goldType = price.name === "สมาคมฯ" ? "ทองสมาคม" : 
                                   price.name === "99.99%" ? "ทอง 99.99%" : 
                                   price.name === "96.5%" ? "ทอง 96.5%" : 
                                   price.name;
                    const summary = getPortfolioSummary(goldType);
                    if (summary.units > 0) {
                      return (
                        <p className="text-sm text-orange-600">
                          พอร์ต: {summary.units.toFixed(4)} หน่วย
                        </p>
                      );
                    }
                  })()}
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
      ))}

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
              disabled={!moneyAmount || Number(moneyAmount) <= 0 || Number(moneyAmount) > balance}
            >
              ยืนยันการซื้อ
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
              return (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">ทองในพอร์ต</p>
                  <p className="text-lg font-semibold">{summary.units.toFixed(4)} หน่วย</p>
                </div>
              );
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
              disabled={!sellUnits || Number(sellUnits) <= 0}
            >
              ยืนยันการขาย
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog 
        open={showSummaryDialog} 
        onOpenChange={setShowSummaryDialog}
      >
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