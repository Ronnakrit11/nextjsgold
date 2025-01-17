'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/auth';

interface WithdrawalRequest {
  id: number;
  goldType: string;
  amount: string;
  name: string;
  tel: string;
  address: string;
  status: string;
  createdAt: string;
}

export default function WithdrawHistoryPage() {
  const { user } = useUser();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWithdrawalHistory() {
      try {
        const response = await fetch('/api/withdraw-history');
        if (response.ok) {
          const data = await response.json();
          setWithdrawals(data);
        }
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchWithdrawalHistory();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Withdrawal History
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-6 w-6 text-orange-500" />
            <span>Your Withdrawal Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{withdrawal.name}</h3>
                      <p className="text-sm text-gray-500">
                        Tel: {withdrawal.tel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {withdrawal.goldType} - {Number(withdrawal.amount).toFixed(4)} บาท
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleString('th-TH')}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery Address:</span><br />
                      {withdrawal.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No withdrawal history yet
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}