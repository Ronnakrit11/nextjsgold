'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// This is a placeholder component that we'll enhance later with real customer data
export function CustomerList() {
  const mockCustomers = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'Active',
      lastActive: '2024-03-20',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      status: 'Inactive',
      lastActive: '2024-03-19',
    },
  ];

  return (
    <div className="space-y-4">
      {mockCustomers.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {mockCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback>
                    {customer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {customer.status}
                </span>
                <span className="text-sm text-gray-500">
                  Last active: {customer.lastActive}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found</p>
        </div>
      )}
    </div>
  );
}