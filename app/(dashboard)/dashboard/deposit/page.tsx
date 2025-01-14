'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, CreditCard, Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsVerifying(true);

      const formData = new FormData();
      formData.append('slip', selectedFile);
      formData.append('amount', amount);

      const response = await fetch('/api/verify-slip', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify slip');
      }

      if (data.verified) {
        toast.success('Transfer slip verified successfully!');
        // Reset form
        setAmount('');
        setSelectedMethod(null);
        setSelectedFile(null);
      } else {
        toast.error(data.message || 'Invalid transfer slip');
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify transfer slip');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: CreditCard,
      accountInfo: 'Bank: 131-8-09271-7\nนายรนกฤต เชียรวิชัย'
    }
  ];

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Deposit Funds
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-orange-500" />
              <span>Make a Deposit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (THB)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <div className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      type="button"
                      variant={selectedMethod === method.id ? 'default' : 'outline'}
                      className={`w-full justify-start space-x-2 h-auto py-4 ${
                        selectedMethod === method.id ? 'bg-orange-500 text-white hover:bg-orange-600' : ''
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <method.icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>{method.name}</span>
                        <span className="text-sm opacity-75 whitespace-pre-line">{method.accountInfo}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slip">Upload Transfer Slip</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="slip"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                    onClick={() => document.getElementById('slip')?.click()}
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    {selectedFile ? (
                      <span className="text-sm">{selectedFile.name}</span>
                    ) : (
                      <span className="text-sm">Click to upload slip</span>
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!amount || !selectedMethod || !selectedFile || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Proceed with Deposit'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, date: '2024-03-20', amount: '10,000', status: 'completed' },
                { id: 2, date: '2024-03-18', amount: '5,000', status: 'pending' },
                { id: 3, date: '2024-03-15', amount: '15,000', status: 'completed' },
              ].map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">฿{deposit.amount}</p>
                    <p className="text-sm text-gray-500">{deposit.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      deposit.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {deposit.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}