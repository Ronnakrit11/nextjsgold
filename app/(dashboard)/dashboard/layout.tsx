'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, UserCircle, Coins, Wallet, BarChart2, FileText, Globe } from 'lucide-react';
import { useUser } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const [navItems, setNavItems] = useState<Array<{
    href: string;
    icon: any;
    label: string;
  }>>([]);

  useEffect(() => {
    // Check if user is admin
    const isAdmin = user?.role === 'admin';
    
    const baseItems = [
      { href: '/dashboard/gold', icon: Coins, label: 'Gold' },
      { href: '/dashboard/asset', icon: BarChart2, label: 'Asset' },
      { href: '/dashboard/transaction', icon: FileText, label: 'Transaction' },
      { href: '/dashboard/deposit', icon: Wallet, label: 'Deposit' },
      { href: '/dashboard/general', icon: Settings, label: 'General' },
      { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
      { href: '/dashboard/security', icon: Shield, label: 'Security' },
    ];

    const adminItems = [
      { href: '/dashboard/set-price', icon: Settings, label: 'Set Price' },
      { href: '/dashboard/customers', icon: UserCircle, label: 'Customers' },
      { href: '/dashboard/website-settings', icon: Globe, label: 'Website Setting' },
      { href: '/dashboard/admin', icon: Shield, label: 'Admin Management' },
    ];

    setNavItems(isAdmin ? [...baseItems, ...adminItems] : baseItems);
  }, [user]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`my-1 w-full justify-start ${
                    pathname === item.href ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}