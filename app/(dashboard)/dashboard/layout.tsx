'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, UserCircle, Coins, Wallet, BarChart2, FileText, Globe, LogOut, ClipboardList, History, Key, CreditCard, BanknoteIcon, Moon, Sun } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { SocialContacts } from '@/components/SocialContacts';
import { useTheme } from '@/lib/theme-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [generalNavItems, setGeneralNavItems] = useState<Array<{
    href: string;
    icon: any;
    label: string;
  }>>([]);
  const [adminNavItems, setAdminNavItems] = useState<Array<{
    href: string;
    icon: any;
    label: string;
  }>>([]);

  useEffect(() => {
    const isAdmin = user?.role === 'admin';
    
    // General menu items for all users
    const baseItems = [
      { href: '/dashboard/gold', icon: Coins, label: 'ซื้อขายทอง' },
      { href: '/dashboard/asset', icon: BarChart2, label: 'สินทรัพย์ทั้งหมด' },
      { href: '/dashboard/transaction', icon: FileText, label: 'รายการซื้อขายทอง' },
      { href: '/dashboard/deposit', icon: Wallet, label: 'ฝากเงิน' },
      { href: '/dashboard/withdraw-money', icon: CreditCard, label: 'ถอนเงิน' },
      { href: '/dashboard/withdraw', icon: LogOut, label: 'ขอรับทอง' },
      { href: '/dashboard/withdraw/history', icon: History, label: 'ประวัติการขอรับทอง' },
      { href: '/dashboard/withdraw-money/history', icon: History, label: 'ประวัติการขอถอนเงิน' },
      { href: '/dashboard/general', icon: Settings, label: 'ตั้งค่า' },
      { href: '/dashboard/security', icon: Shield, label: 'เปลี่ยนรหัสผ่าน' },
      { href: '/dashboard/2fa', icon: Key, label: 'ตั้งค่า 2FA' },
      { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    ];

    // Admin-only menu items
    const adminItems = [
      { href: '/dashboard/set-price', icon: Settings, label: 'กำหนดราคา' },
      { href: '/dashboard/customers', icon: UserCircle, label: 'ลูกค้าทั้งหมด' },
      { href: '/dashboard/withdraw-money-requests', icon: BanknoteIcon, label: 'รายการขอถอนเงิน' },
      { href: '/dashboard/withdraw-list', icon: ClipboardList, label: 'รายการขอรับทอง' },
      { href: '/dashboard/website-settings', icon: Globe, label: 'จัดการเว็บไซต์' },
      { href: '/dashboard/admin', icon: Shield, label: 'จัดการเเอดมิน' },
    ];

    setGeneralNavItems(baseItems);
    setAdminNavItems(isAdmin ? adminItems : []);
  }, [user]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <span className="font-medium dark:text-white">Settings</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white dark:bg-gray-800 lg:bg-gray-50 lg:dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {/* Theme Toggle (Desktop) */}
            <div className="hidden lg:flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* General Menu Items */}
            <div className="mb-6">
              <h2 className="px-2 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">GENERAL</h2>
              {generalNavItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={`my-1 w-full justify-start ${
                      pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Admin Menu Items */}
            {adminNavItems.length > 0 && (
              <div>
                <h2 className="px-2 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">ADMIN</h2>
                {adminNavItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={`my-1 w-full justify-start ${
                        pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4 bg-gray-50 dark:bg-gray-900">{children}</main>
        <SocialContacts/>
      </div>
    </div>
  );
}
