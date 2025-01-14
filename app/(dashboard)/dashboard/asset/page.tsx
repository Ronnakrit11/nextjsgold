import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Wallet } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { userBalances } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

async function getUserBalance(userId: number) {
  const balance = await db
    .select()
    .from(userBalances)
    .where(eq(userBalances.userId, userId))
    .limit(1);

  return balance[0]?.balance || 0;
}

export default async function AssetPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const balance = await getUserBalance(user.id);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Asset Overview
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-orange-500" />
              <span>Your Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <p className="text-3xl font-bold text-orange-500">
                ฿{Number(balance).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Available Balance
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6 text-orange-500" />
              <span>Asset Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500">Asset distribution will go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}