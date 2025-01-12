import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

export default function SetPricePage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Set Price
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-6 w-6 text-orange-500" />
            <span>Price Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Price settings will be implemented here.</p>
        </CardContent>
      </Card>
    </section>
  );
}