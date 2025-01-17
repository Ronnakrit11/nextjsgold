'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ClipboardList } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface WithdrawalRequest {
  id: number;
  userId: number;
  goldType: string;
  amount: string;
  name: string;
  tel: string;
  address: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
}

export default function WithdrawListPage() {
  const { user } = useUser();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const response = await fetch('/api/withdraw-requests');
        if (response.ok) {
          const data = await response.json();
          setWithdrawals(data);
        }
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'admin') {
      fetchWithdrawals();
    }
  }, [user]);

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'admin') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 text-center max-w-md">
              Only administrators have access to the withdrawal list. Please contact an administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Withdrawal Requests
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-orange-500" />
            <span>Pending Withdrawals</span>
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
                        Requested by: {withdrawal.user.email}
                      </p>
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
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery Address:</span><br />
                      {withdrawal.address}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No withdrawal requests yet
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}