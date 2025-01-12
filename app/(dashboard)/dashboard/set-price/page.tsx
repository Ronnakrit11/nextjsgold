'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag, Save, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'ronnakritnook1@gmail.com';

interface MarkupSettings {
  goldSpot: number;
  gold9999: number;
  gold965: number;
  goldAssociation: number;
  goldSpotAsk: number;
  gold9999Ask: number;
  gold965Ask: number;
  goldAssociationAsk: number;
}

// Create a simple localStorage wrapper for markup settings
const getStoredMarkup = (): MarkupSettings => {
  if (typeof window === 'undefined') return {
    goldSpot: 0,
    gold9999: 0,
    gold965: 0,
    goldAssociation: 0,
    goldSpotAsk: 0,
    gold9999Ask: 0,
    gold965Ask: 0,
    goldAssociationAsk: 0,
  };
  const stored = localStorage.getItem('markupSettings');
  return stored ? JSON.parse(stored) : {
    goldSpot: 0,
    gold9999: 0,
    gold965: 0,
    goldAssociation: 0,
    goldSpotAsk: 0,
    gold9999Ask: 0,
    gold965Ask: 0,
    goldAssociationAsk: 0,
  };
};

export default function SetPricePage() {
  const { user } = useUser();
  const [markupSettings, setMarkupSettings] = useState<MarkupSettings>(() => 
    getStoredMarkup()
  );

  // Redirect to dashboard if user is not logged in
  if (!user) {
    redirect('/sign-in');
  }

  // Show access denied message if user is not the admin
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('markupSettings', JSON.stringify(markupSettings));
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string to handle backspace when typing negative numbers
    const newValue = value === '' ? 0 : parseFloat(value);
    setMarkupSettings(prev => ({
      ...prev,
      [name]: newValue
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
            <span>Gold Price Markup Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goldSpot">Gold Spot Bid Markup (%)</Label>
                  <Input
                    id="goldSpot"
                    name="goldSpot"
                    type="number"
                    step="any"
                    value={markupSettings.goldSpot}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to Gold Spot bid price
                  </p>
                </div>
                <div>
                  <Label htmlFor="goldSpotAsk">Gold Spot Ask Markup (%)</Label>
                  <Input
                    id="goldSpotAsk"
                    name="goldSpotAsk"
                    type="number"
                    step="any"
                    value={markupSettings.goldSpotAsk}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to Gold Spot ask price
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold9999">Gold 99.99% Bid Markup (%)</Label>
                  <Input
                    id="gold9999"
                    name="gold9999"
                    type="number"
                    step="any"
                    value={markupSettings.gold9999}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to 99.99% gold bid price
                  </p>
                </div>
                <div>
                  <Label htmlFor="gold9999Ask">Gold 99.99% Ask Markup (%)</Label>
                  <Input
                    id="gold9999Ask"
                    name="gold9999Ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold9999Ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to 99.99% gold ask price
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gold965">Gold 96.5% Bid Markup (%)</Label>
                  <Input
                    id="gold965"
                    name="gold965"
                    type="number"
                    step="any"
                    value={markupSettings.gold965}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to 96.5% gold bid price
                  </p>
                </div>
                <div>
                  <Label htmlFor="gold965Ask">Gold 96.5% Ask Markup (%)</Label>
                  <Input
                    id="gold965Ask"
                    name="gold965Ask"
                    type="number"
                    step="any"
                    value={markupSettings.gold965Ask}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to 96.5% gold ask price
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goldAssociation">Gold Association Bid Markup (%)</Label>
                  <Input
                    id="goldAssociation"
                    name="goldAssociation"
                    type="number"
                    step="any"
                    value={markupSettings.goldAssociation}
                    onChange={handleInputChange}
                    placeholder="Enter bid markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to Gold Association bid price
                  </p>
                </div>
                <div>
                  <Label htmlFor="goldAssociationAsk">Gold Association Ask Markup (%)</Label>
                  <Input
                    id="goldAssociationAsk"
                    name="goldAssociationAsk"
                    type="number"
                    step="any"
                    value={markupSettings.goldAssociationAsk}
                    onChange={handleInputChange}
                    placeholder="Enter ask markup percentage"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage added to Gold Association ask price
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Markup Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}