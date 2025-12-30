'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Wrench,
  MessageCircle,
  Megaphone,
  Car,
  Package,
  ShoppingCart,
  Tool,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  MessageSquare,
  BarChart3
} from 'lucide-react';

export default function Sidebar({ userRole }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'sales', 'service', 'inventory', 'accountant'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager', 'sales'] },
    { name: 'Leads', href: '/leads', icon: UserPlus, roles: ['admin', 'manager', 'sales'] },
    { name: 'Service Requests', href: '/service-requests', icon: Wrench, roles: ['admin', 'manager', 'service'] },
    { name: 'Customer Engagement', href: '/customer-engagement', icon: MessageCircle, roles: ['admin', 'manager', 'sales'] },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone, roles: ['admin', 'manager'] },
    { name: 'Vehicles', href: '/inventory/vehicles', icon: Car, roles: ['admin', 'manager', 'inventory', 'sales'] },
    { name: 'Parts', href: '/inventory/parts', icon: Package, roles: ['admin', 'manager', 'inventory', 'service'] },
    { name: 'Sales Orders', href: '/sales', icon: ShoppingCart, roles: ['admin', 'manager', 'sales', 'accountant'] },
    { name: 'Repair Orders', href: '/repair-orders', icon: Tool, roles: ['admin', 'manager', 'service'] },
    { name: 'Appointments', href: '/service-appointments', icon: Calendar, roles: ['admin', 'manager', 'service'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['admin', 'manager', 'accountant'] },
    { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'manager', 'accountant'] },
    { name: 'Compliance', href: '/compliance', icon: Shield, roles: ['admin', 'manager'] },
    { name: 'Communications', href: '/communications', icon: MessageSquare, roles: ['admin', 'manager', 'sales', 'service'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'manager', 'accountant'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}