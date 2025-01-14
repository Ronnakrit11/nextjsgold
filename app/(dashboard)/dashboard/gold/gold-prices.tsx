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

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [balance, setBalance] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState<GoldPrice | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [moneyAmount, setMoneyAmount] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<{
    goldType: string;
    units: number;
    price: number;
    total: number;
  } | null>(null);

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

  async function fetchData() {
    try {
      // Fetch user balance
      const balanceResponse = await fetch('/api/user/balance');
      const balanceData = await balanceResponse.json();
      setBalance(Number(balanceData.balance));

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
    setMoneyAmount('');
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

      setBalance(prev => prev - moneyNum);
      
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
    if (!selectedPrice || !moneyAmount) return;

    try {
      const moneyNum = parseFloat(moneyAmount);
      const pricePerUnit = typeof selectedPrice.bid === 'string' ? 
        parseFloat(selectedPrice.bid) : selectedPrice.bid;
      const units = moneyNum / pricePerUnit;

      const response = await fetch('/api/transactions/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goldType: selectedPrice.name === 'GoldSpot' ? 'GoldSpot' :
                   selectedPrice.name === '99.99%' ? 'ทอง 99.99%' :
                   selectedPrice.name === '96.5%' ? 'ทอง 96.5%' :
                   'ทองสมาคม',
          amount: units,
          pricePerUnit,
          totalPrice: moneyNum
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process sale');
      }

      toast.success('ขายทองสำเร็จ');
      setIsSellDialogOpen(false);
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
                <p className="text-sm opacity-80">ยอดเงินคงเหลือ</p>
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
                  {(Number(moneyAmount) / Number(selectedPrice.ask)).toFixed(4)} บาท
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
            <div className="space-y-2">
              <Label>จำนวนเงิน</Label>
              <Input
                type="number"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="ระบุจำนวนเงินที่ต้องการขาย"
              />
            </div>
            {moneyAmount && selectedPrice && (
              <div className="space-y-2">
                <Label>จำนวนทอง</Label>
                <p className="text-lg font-semibold">
                  {(Number(moneyAmount) / Number(selectedPrice.bid)).toFixed(4)} บาท
                </p>
              </div>
            )}
            <Button
              onClick={handleSellSubmit}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
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
            <DialogTitle>สรุปรายการซื้อทอง</DialogTitle>
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
                    <span className="font-medium">{transactionSummary.units.toFixed(4)} บาท</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคาต่อบาท</span>
                    <span className="font-medium">฿{transactionSummary.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>ยอดรวมทั้งสิ้น</span>
                      <span className="text-green-600">฿{transactionSummary.total.toLocaleString()}</span>
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