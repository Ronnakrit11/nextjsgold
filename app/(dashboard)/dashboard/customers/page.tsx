import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { CustomerList } from './customer-list';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { desc, isNull } from 'drizzle-orm';
import { ShieldAlert } from 'lucide-react';

export default async function CustomersPage() {
  const currentUser = await getUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  if (currentUser.role !== 'admin') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 text-center max-w-md">
              Only administrators have access to the customer list. Please contact an administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Get all users except deleted ones
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Customers
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerList users={allUsers} />
        </CardContent>
      </Card>
    </section>
  );
}