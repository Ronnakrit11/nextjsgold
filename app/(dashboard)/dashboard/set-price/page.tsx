"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag, Save, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'ronnakritnook1@gmail.com';

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

export default function SetPricePage() {
  const { user } = useUser();
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

  useEffect(() => {
    async function fetchMarkupSettings() {
      try {
        const response = await fetch('/api/markup');
        if (response.ok) {
          const data = await response.json();
          setMarkupSettings(data);
        }
      } catch (error) {
        console.error('Error fetching markup settings:', error);
      }
    }

    fetchMarkupSettings();
  }, []);

  if (!user) {
    redirect('/sign-in');
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 text-center max-w-md">
              Only the administrator has access to the price settings. Please contact the administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/markup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goldSpot: markupSettings.gold_spot_bid,
          goldSpotAsk: markupSettings.gold_spot_ask,
          gold9999: markupSettings.gold_9999_bid,
          gold9999Ask: markupSettings.gold_9999_ask,
          gold965: markupSettings.gold_965_bid,
          gold965Ask: markupSettings.gold_965_ask,
          goldAssociation: markupSettings.gold_association_bid,
          goldAssociationAsk: markupSettings.gold_association_ask,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update markup settings');
      }

      alert('Markup settings updated successfully');
    } catch (error) {
      console.error('Error updating markup settings:', error);
      alert('Failed to update markup settings');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMarkupSettings(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value),
    }));
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Set Price
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-6 w-6 text-orange-500" />
            <span>Gold Price  Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold_spot_bid">Gold Spot Bid  (%)</Label>
                  <Input
                    id="gold_spot_bid"
                    name="gold_spot_bid"
                    type="number"
                    step="any"
                    value={markupSettings.gold_spot_bid}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gold_spot_ask">Gold Spot Ask  (%)</Label>
                  <Input
                    id="gold_spot_ask"
                    name="gold_spot_ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold_spot_ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold_9999_bid">Gold 99.99% Bid  (%)</Label>
                  <Input
                    id="gold_9999_bid"
                    name="gold_9999_bid"
                    type="number"
                    step="any"
                    value={markupSettings.gold_9999_bid}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gold_9999_ask">Gold 99.99% Ask  (%)</Label>
                  <Input
                    id="gold_9999_ask"
                    name="gold_9999_ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold_9999_ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold_965_bid">Gold 96.5% Bid  (%)</Label>
                  <Input
                    id="gold_965_bid"
                    name="gold_965_bid"
                    type="number"
                    step="any"
                    value={markupSettings.gold_965_bid}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gold_965_ask">Gold 96.5% Ask  (%)</Label>
                  <Input
                    id="gold_965_ask"
                    name="gold_965_ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold_965_ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold_association_bid">Gold Association Bid  (%)</Label>
                  <Input
                    id="gold_association_bid"
                    name="gold_association_bid"
                    type="number"
                    step="any"
                    value={markupSettings.gold_association_bid}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gold_association_ask">Gold Association Ask  (%)</Label>
                  <Input
                    id="gold_association_ask"
                    name="gold_association_ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold_association_ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Price Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}