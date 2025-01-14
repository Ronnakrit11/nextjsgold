'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/auth';

interface Transaction {
  id: number;
  goldType: string;
  amount: string;
  purchasePrice: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export default function TransactionPage() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === 'ronnakritnook1@gmail.com';

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/transactions/history');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Transaction History
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-orange-500" />
            <span>{isAdmin ? 'All User Transactions' : 'Your Transactions'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <ArrowDownCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        ซื้อ {transaction.goldType}
                      </p>
                      {isAdmin && transaction.user && (
                        <p className="text-sm text-orange-600">
                          by {transaction.user.name || transaction.user.email}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      -฿{(Number(transaction.amount) * Number(transaction.purchasePrice)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Number(transaction.amount).toFixed(4)} บาท @ ฿{Number(transaction.purchasePrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีประวัติการทำรายการ
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}