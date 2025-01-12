import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeamForUser } from '@/lib/db/queries';
import { CustomerList } from './customer-list';

export default async function CustomersPage() {
  const teamData = await getTeamForUser(1); // We'll improve this later with actual customer data

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
          <CustomerList />
        </CardContent>
      </Card>
    </section>
  );
}