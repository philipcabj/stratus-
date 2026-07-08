'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Cable,
  Bell,
  Settings,
  LogOut,
  Cloud,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { href: '/admin',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/clients',  label: 'Clientes',     icon: Users },
  { href: '/admin/connectors', label: 'Conectores', icon: Cable },
  { href: '/admin/alerts',   label: 'Alertas',      icon: Bell },
  { href: '/admin/settings', label: 'Configuración',icon: Settings },
];

const clientNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/connectors', label: 'Conectores', icon: Cable },
  { href: '/dashboard/alerts',     label: 'Alertas',    icon: Bell },
  { href: '/dashboard/settings',   label: 'Configuración', icon: Settings },
];

interface SidebarProps {
  variant: 'admin' | 'client';
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const nav = variant === 'admin' ? adminNav : clientNav;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className="flex flex-col w-[210px] min-h-screen flex-shrink-0"
      style={{ backgroundColor: '#0E1B2C' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-archivo font-700 text-white text-sm leading-tight tracking-wide">STRATUS</p>
            <p className="text-white/40 text-[10px] leading-tight tracking-widest uppercase">Panel Multicloud</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/50
                     hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
