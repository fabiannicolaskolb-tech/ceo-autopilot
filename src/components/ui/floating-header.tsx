import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Lightbulb, CalendarDays, BarChart3, Settings, Zap, LogOut, MenuIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Profil Setup', url: '/profile', icon: User },
  { title: 'Ideation Lab', url: '/ideation', icon: Lightbulb },
  { title: 'Planner', url: '/planner', icon: CalendarDays },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Einstellungen', url: '/settings', icon: Settings },
];

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-playfair text-base font-semibold text-foreground">CEO Autopilot</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {user && (
            <span className="max-w-[160px] truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              className="lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <SheetContent side="right" className="flex w-72 flex-col bg-card">
              <div className="flex items-center gap-2 px-2 pb-4 pt-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-playfair text-base font-semibold text-foreground">CEO Autopilot</span>
              </div>

              <nav className="flex flex-1 flex-col gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                        active
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>

              <SheetFooter className="mt-auto border-t border-border pt-4">
                {user && (
                  <div className="mb-2 truncate text-xs text-muted-foreground">{user.email}</div>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => { signOut(); setOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
