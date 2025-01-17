'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/lib/auth';
import Image from 'next/image';

interface GoldAsset {
  goldType: string;
  amount: string;
  purchasePrice: string;
}

export default function WithdrawPage() {
  const { user } = useUser();
  const [assets, setAssets] = useState<GoldAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [contactDetails, setContactDetails] = useState({
    name: '',
    tel: '',
    address: ''
  });

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch('/api/gold-assets');
        if (response.ok) {
          const data = await response.json();
          setAssets(data.filter((asset: GoldAsset) => Number(asset.amount) > 0));
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast.error('Failed to fetch gold assets');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchAssets();
    }
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset || !withdrawAmount) {
      toast.error('Please select an asset and enter withdrawal amount');
      return;
    }

    if (!contactDetails.name || !contactDetails.tel || !contactDetails.address) {
      toast.error('Please fill in all contact details');
      return;
    }

    const asset = assets.find(a => a.goldType === selectedAsset);
    if (!asset) {
      toast.error('Selected asset not found');
      return;
    }

    if (Number(withdrawAmount) > Number(asset.amount)) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }

    // Here you would typically make an API call to process the withdrawal
    toast.info('Withdrawal request submitted. Please contact support to arrange physical gold collection.');
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
        Withdraw Gold
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-6 w-6 text-orange-500" />
              <span>Withdraw Physical Gold</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Gold Type</Label>
                <div className="grid gap-4">
                  {assets.map((asset) => (
                    <Button
                      key={asset.goldType}
                      type="button"
                      variant={selectedAsset === asset.goldType ? 'default' : 'outline'}
                      className={`w-full justify-start space-x-2 h-auto py-4 ${
                        selectedAsset === asset.goldType ? 'bg-orange-500 text-white hover:bg-orange-600' : ''
                      }`}
                      onClick={() => setSelectedAsset(asset.goldType)}
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <Image 
                          src="/gold.png" 
                          alt="Gold" 
                          width={40} 
                          height={40}
                          className="rounded-md"
                        />
                        <div className="flex flex-col items-start">
                          <span>{asset.goldType}</span>
                          <span className="text-sm opacity-75">Available: {Number(asset.amount).toFixed(4)} บาท</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (บาททอง)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  value={withdrawAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const asset = assets.find(a => a.goldType === selectedAsset);
                    if (!asset || Number(value) <= Number(asset.amount)) {
                      setWithdrawAmount(value);
                    }
                  }}
                  placeholder="Enter amount to withdraw"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={contactDetails.name}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tel">Telephone</Label>
                <Input
                  id="tel"
                  type="tel"
                  value={contactDetails.tel}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, tel: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={contactDetails.address}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your delivery address"
                  required
                />
              </div>

              <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-800">
                <p>Important Notes:</p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Physical gold withdrawal requires verification</li>
                  <li>Please contact support to arrange collection</li>
                  <li>Minimum withdrawal: 1 บาททอง</li>
                  <li>Processing time: 1-2 business days</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!selectedAsset || !withdrawAmount || Number(withdrawAmount) <= 0}
              >
                Request Withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Step 1: Submit Request</h3>
                <p className="text-sm text-gray-600">
                  Select your gold type and enter the amount you wish to withdraw.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Step 2: Verification</h3>
                <p className="text-sm text-gray-600">
                  Our team will verify your withdrawal request and contact you.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Step 3: Collection</h3>
                <p className="text-sm text-gray-600">
                  Visit our office with proper identification to collect your physical gold.
                </p>
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600">
                  For assistance with withdrawals, please contact our support team:
                  <br />
                  Email: support@example.com
                  <br />
                  Phone: +66 XX-XXX-XXXX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}