'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>({
    gold_spot_bid: 0,
    gold_spot_ask: 0,
    gold_9999_bid: 0,
    gold_9999_ask: 0,
    gold_965_bid: 0,
    gold_965_ask: 0,
    gold_association_bid: 0,
    gold_association_ask: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedGold, setSelectedGold] = useState<GoldPrice | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

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
        setMarkupSettings({
          gold_spot_bid: 0,
          gold_spot_ask: 0,
          gold_9999_bid: 0,
          gold_9999_ask: 0,
          gold_965_bid: 0,
          gold_965_ask: 0,
          gold_association_bid: 0,
          gold_association_ask: 0,
        });
      } finally {
        setLoading(false);
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
          .filter((price: GoldPrice) => ['GoldSpot', 'Silver', 'THB', 'สมาคมฯ', '96.5%', '99.99%'].includes(price.name))
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
        setUpdating(false);
      }
    }

    if (!loading) {
      fetchGoldPrices();
      const interval = setInterval(fetchGoldPrices, 10000);
      return () => clearInterval(interval);
    }
  }, [markupSettings, loading]);

  const handleBuyClick = (price: GoldPrice) => {
    setSelectedGold(price);
    setBuyDialogOpen(true);
  };

  const handleSellClick = (price: GoldPrice) => {
    setSelectedGold(price);
    setSellDialogOpen(true);
  };

  const handleBuySubmit = async () => {
    if (!selectedGold || !amount) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/transactions/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goldType: selectedGold.name === 'สมาคมฯ' ? 'ทองสมาคม' : 
                   selectedGold.name === '99.99%' ? 'ทอง 99.99%' : 
                   selectedGold.name === '96.5%' ? 'ทอง 96.5%' : selectedGold.name,
          amount: parseFloat(amount),
          pricePerUnit: selectedGold.ask,
          totalPrice: parseFloat(amount) * Number(selectedGold.ask),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process purchase');
      }

      toast.success('ซื้อทองคำเรียบร้อยแล้ว');
      setBuyDialogOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการซื้อทองคำ');
    } finally {
      setProcessing(false);
    }
  };

  const handleSellSubmit = async () => {
    if (!selectedGold || !amount) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/transactions/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goldType: selectedGold.name === 'สมาคมฯ' ? 'ทองสมาคม' : 
                   selectedGold.name === '99.99%' ? 'ทอง 99.99%' : 
                   selectedGold.name === '96.5%' ? 'ทอง 96.5%' : selectedGold.name,
          amount: parseFloat(amount),
          pricePerUnit: selectedGold.bid,
          totalPrice: parseFloat(amount) * Number(selectedGold.bid),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process sale');
      }

      toast.success('ขายทองคำเรียบร้อยแล้ว');
      setSellDialogOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการขายทองคำ');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
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
                <p className="text-sm text-gray-500">
                  ราคารับซื้อ<br />
                  {price.name === "GoldSpot" ? 
                    `$${Number(price.bid).toLocaleString()}` : 
                    `${Number(price.bid).toLocaleString()} บาท`}
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
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => handleBuyClick(price)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1"
                size="sm"
              >
                ซื้อ
              </Button>
              <Button
                onClick={() => handleSellClick(price)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1"
                size="sm"
              >
                ขาย
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Buy Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ซื้อทองคำ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ประเภททองคำ</Label>
              <p className="font-medium">{selectedGold?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>ราคาต่อหน่วย</Label>
              <p className="font-medium">฿{Number(selectedGold?.ask).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวน (หน่วย)</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {amount && (
              <div className="space-y-2">
                <Label>ยอดรวม</Label>
                <p className="text-xl font-bold text-green-600">
                  ฿{(parseFloat(amount) * Number(selectedGold?.ask)).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleBuySubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!amount || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังทำรายการ...
                </>
              ) : (
                'ยืนยันการซื้อ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ขายทองคำ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ประเภททองคำ</Label>
              <p className="font-medium">{selectedGold?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>ราคารับซื้อต่อหน่วย</Label>
              <p className="font-medium">฿{Number(selectedGold?.bid).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวน (หน่วย)</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {amount && (
              <div className="space-y-2">
                <Label>ยอดรวม</Label>
                <p className="text-xl font-bold text-red-600">
                  ฿{(parseFloat(amount) * Number(selectedGold?.bid)).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSellSubmit}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={!amount || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังทำรายการ...
                </>
              ) : (
                'ยืนยันการขาย'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}