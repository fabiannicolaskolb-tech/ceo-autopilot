import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, GalleryHorizontalEnd, BarChart3, Zap, LogOut, MenuIcon, User, Sun, Moon, Globe,
} from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

function getInitials(email?: string | null, name?: string | null) {
  if (name) return name.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();

  const navItems = [
    { title: t('nav.dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('nav.ideation'), url: '/ideation', icon: Lightbulb },
    { title: t('nav.postlibrary'), url: '/post-library', icon: GalleryHorizontalEnd },
    { title: t('nav.analytics'), url: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Briefly
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-2 text-[13px] transition-colors',
                      active
                        ? 'font-semibold text-foreground'
                        : 'font-medium text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
                    {item.title}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" />
            {lang === 'de' ? 'EN' : 'DE'}
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Desktop avatar dropdown */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(user?.email, profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  {t('nav.signout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="h-9 w-9">
                  <MenuIcon className="h-5 w-5" />
                </Button>
                <SheetContent side="right" className="flex w-72 flex-col bg-background">
                  <div className="flex items-center gap-2.5 px-1 pb-6 pt-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Zap className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-foreground">
                      Briefly
                    </span>
                  </div>

                  <nav className="flex flex-1 flex-col gap-0.5">
                    {navItems.map((item) => {
                      const active = location.pathname === item.url;
                      return (
                        <Link
                          key={item.url}
                          to={item.url}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors',
                            active
                              ? 'font-semibold text-foreground bg-primary/5'
                              : 'font-medium text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          <item.icon className="h-4 w-4" strokeWidth={2} />
                          {item.title}
                        </Link>
                      );
                    })}
                    <div className="my-2 h-px bg-border" />
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <User className="h-4 w-4" strokeWidth={2} />
                      {t('nav.profile')}
                    </Link>
                  </nav>

                  <SheetFooter className="mt-auto border-t border-border pt-4">
                    {user && (
                      <p className="mb-2 truncate text-xs text-muted-foreground">{user.email}</p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-[13px]"
                      onClick={() => { signOut(); setOpen(false); }}
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                      {t('nav.signout')}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
