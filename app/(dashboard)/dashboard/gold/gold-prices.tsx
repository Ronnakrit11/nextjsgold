'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

interface TransactionInfo {
  goldType: string;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  timestamp: string;
}

function TransactionSuccessDialog({
  isOpen,
  onClose,
  transaction
}: {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionInfo;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-green-600 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            ทำรายการสำเร็จ
          </DialogTitle>
          <DialogDescription>
            รายละเอียดการทำรายการ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ประเภททองคำ</span>
              <span className="font-medium">{transaction.goldType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">จำนวน</span>
              <span className="font-medium">{transaction.amount.toFixed(4)} หน่วย</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ราคาต่อหน่วย</span>
              <span className="font-medium">฿{transaction.pricePerUnit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-600">ยอดรวม</span>
              <span className="text-orange-600">฿{transaction.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            เวลาทำรายการ: {new Date(transaction.timestamp).toLocaleString('th-TH')}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BuyDialog({ 
  isOpen, 
  onClose, 
  price, 
  goldType, 
  userBalance 
}: { 
  isOpen: boolean;
  onClose: () => void;
  price: GoldPrice;
  goldType: string;
  userBalance: number;
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<TransactionInfo | null>(null);
  const askPrice = Number(price.ask);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    const numValue = Number(value);
    if (numValue <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ต้องการซื้อ');
    } else if (numValue > userBalance) {
      setError('ยอดเงินไม่เพียงพอ');
    } else {
      setError('');
    }
  };

  const handleBuy = async () => {
    if (!amount || error) return;

    const numAmount = Number(amount);
    const calculatedUnits = numAmount / askPrice;

    try {
      const response = await fetch('/api/transactions/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goldType,
          amount: calculatedUnits,
          pricePerUnit: askPrice,
          totalPrice: numAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process purchase');
      }

      const data = await response.json();
      
      setTransaction({
        goldType,
        amount: calculatedUnits,
        pricePerUnit: askPrice,
        totalPrice: numAmount,
        timestamp: new Date().toISOString()
      });

      toast.success('ซื้อทองคำเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการทำรายการ');
    }
  };

  return (
    <>
      <Dialog open={isOpen && !transaction} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ซื้อ {goldType}</DialogTitle>
            <DialogDescription>
              กรุณาระบุจำนวนเงินที่ต้องการซื้อ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">ยอดเงินคงเหลือ</label>
              <p className="text-lg font-semibold">฿{userBalance.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">จำนวนเงินที่ต้องการซื้อ</label>
              <Input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="ระบุจำนวนเงิน"
                className="mt-1"
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            {amount && !error && (
              <div>
                <label className="text-sm text-gray-500">จำนวนทองที่จะได้รับ</label>
                <p className="text-lg font-semibold">
                  {(Number(amount) / askPrice).toFixed(4)} หน่วย
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleBuy}
              disabled={!amount || !!error}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              ยืนยันการซื้อ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {transaction && (
        <TransactionSuccessDialog
          isOpen={!!transaction}
          onClose={() => {
            setTransaction(null);
            onClose();
          }}
          transaction={transaction}
        />
      )}
    </>
  );
}

export function GoldPrices() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>(defaultMarkupSettings);
  const [markupLoading, setMarkupLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<GoldPrice | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    async function fetchUserBalance() {
      try {
        const response = await fetch('/api/user/balance');
        if (response.ok) {
          const data = await response.json();
          setUserBalance(Number(data.balance));
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    }

    fetchUserBalance();
  }, []);

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
      const interval = setInterval(fetchGoldPrices, 10000);
      return () => clearInterval(interval);
    }
  }, [markupSettings, markupLoading]);

  const handleBuyClick = (price: GoldPrice) => {
    setSelectedPrice(price);
    setBuyDialogOpen(true);
  };

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
                <p className="text-sm text-gray-500">ราคารับซื้อ
                  <br />
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
            <div className="mt-4">
              <Button
                onClick={() => handleBuyClick(price)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                ซื้อ
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedPrice && (
        <BuyDialog
          isOpen={buyDialogOpen}
          onClose={() => setBuyDialogOpen(false)}
          price={selectedPrice}
          goldType={
            selectedPrice.name === "สมาคมฯ" ? "ทองสมาคม" :
            selectedPrice.name === "99.99%" ? "ทอง 99.99%" :
            selectedPrice.name === "96.5%" ? "ทอง 96.5%" :
            selectedPrice.name
          }
          userBalance={userBalance}
        />
      )}
    </div>
  );
}

const defaultMarkupSettings = {
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