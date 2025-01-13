import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default function AssetPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Asset Overview
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-orange-500" />
            <span>Your Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-500">Asset content will go here</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}