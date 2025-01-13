import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { GoldPrices } from './gold-prices';
import { GoldChart } from '@/components/GoldChart';

export default function GoldPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Gold Dashboard
      </h1>
      <div className="mb-8">
      <GoldChart />
      <br />
        <GoldPrices />
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-orange-500" />
              <span>Gold Price Chart</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-6 w-6 text-orange-500" />
            <span>Gold Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-orange-500">1,234 Gold</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Transaction</p>
                <p className="text-lg text-gray-700">+50 Gold (2 hours ago)</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Earned', amount: 50, time: '2 hours ago' },
                  { action: 'Spent', amount: -20, time: '1 day ago' },
                  { action: 'Earned', amount: 100, time: '3 days ago' },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.action}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <p
                      className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount} Gold
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}