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

  const isDark = theme === 'dark';

  useEffect(() => {
    const isAdmin = user?.role === 'admin';
    
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
    <div className={`flex flex-col min-h-screen w-full ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
      {/* Mobile header */}
      <div className={`lg:hidden flex items-center justify-between ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center">
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={isDark ? 'text-white' : 'text-gray-900'}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={isDark ? 'text-white' : 'text-gray-900'}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 h-full">
        {/* Sidebar */}
        <aside
          className={`w-56 lg:w-64 ${
            isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-gray-50 border-gray-200'
          } border-r flex-shrink-0 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:relative inset-y-0 left-0 z-50 h-full`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {/* Theme Toggle (Desktop) */}
            <div className="hidden lg:flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`${isDark ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'}`}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* General Menu Items */}
            <div className="mb-6">
              <h2 className={`px-2 mb-2 text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>GENERAL</h2>
              {generalNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={`my-1 w-full justify-start ${
                      isDark
                        ? `text-gray-300 hover:text-white hover:bg-gray-800 ${pathname === item.href ? 'bg-gray-800 text-white' : ''}`
                        : `text-gray-600 hover:text-gray-900 hover:bg-gray-200 ${pathname === item.href ? 'bg-gray-200 text-gray-900' : ''}`
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
                <h2 className={`px-2 mb-2 text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ADMIN</h2>
                {adminNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={`my-1 w-full justify-start ${
                        isDark
                          ? `text-gray-300 hover:text-white hover:bg-gray-800 ${pathname === item.href ? 'bg-gray-800 text-white' : ''}`
                          : `text-gray-600 hover:text-gray-900 hover:bg-gray-200 ${pathname === item.href ? 'bg-gray-200 text-gray-900' : ''}`
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

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
          {children}
        </main>
        <SocialContacts/>
      </div>
    </div>
  );
}
