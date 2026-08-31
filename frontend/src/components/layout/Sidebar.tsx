import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/hooks/use-auth';
import ikonClose from '@/assets/icons/nav/x-close.svg';
import { navItemsForRole } from './nav-config';

interface SidebarProps {
  /** Untuk mode mobile (drawer). */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const items = navItemsForRole(user?.role);

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full max-h-dvh min-h-0 w-80 flex-col border-r border-slate-200 bg-surface transition-transform lg:static lg:h-full lg:max-h-full lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header — h-20 sama dengan PublicSidebar & breadcrumb landing */}
        <div className="relative flex h-20 shrink-0 items-center justify-center border-b border-slate-100 px-5">
          <Logo className="h-8" />
          <button
            className="absolute right-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <span
              aria-hidden
              className="block h-5 w-5 bg-current"
              style={{
                mask: `url("${ikonClose}") center / contain no-repeat`,
                WebkitMask: `url("${ikonClose}") center / contain no-repeat`,
              }}
            />
          </button>
        </div>

        <nav
          aria-label="Menu"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 [webkit-overflow-scrolling:touch]"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors',
                  isActive
                    ? 'font-bold text-brand-600 dark:text-brand-300'
                    : 'font-medium text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white',
                )
              }
            >
              {item.icon && (
                <span
                  aria-hidden
                  className="h-5 w-5 shrink-0"
                  style={{
                    backgroundColor: 'currentColor',
                    mask: `url("${item.icon}") center / contain no-repeat`,
                    WebkitMask: `url("${item.icon}") center / contain no-repeat`,
                  }}
                />
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="flex min-h-20 shrink-0 items-center border-t border-slate-100 px-4 text-sm text-slate-400">
          {env.appName} · v0.1.0
        </p>
      </aside>
    </>
  );
}
