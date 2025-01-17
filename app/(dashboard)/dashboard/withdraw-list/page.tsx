'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ClipboardList } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function WithdrawListPage() {
  const { user } = useUser();

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
          <div className="text-center py-8 text-gray-500">
            No withdrawal requests yet
          </div>
        </CardContent>
      </Card>
    </section>
  );
}