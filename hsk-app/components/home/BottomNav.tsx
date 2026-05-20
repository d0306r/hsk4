// components/home/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Settings, Home, NotebookPen } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: '홈',
    icon: Home,
    isActive: (p) => p === '/',
  },
  {
    href: '/notes',
    label: '오답',
    icon: NotebookPen,
    isActive: (p) => p.startsWith('/notes'),
  },
  {
    href: '/stats',
    label: '통계',
    icon: BarChart3,
    isActive: (p) => p.startsWith('/stats'),
  },
  {
    href: '/settings',
    label: '설정',
    icon: Settings,
    isActive: (p) => p.startsWith('/settings'),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile
                    bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                    border-t border-slate-200 dark:border-slate-700
                    pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}