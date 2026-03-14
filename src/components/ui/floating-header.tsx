import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Lightbulb, CalendarDays, BarChart3, Zap, LogOut, MenuIcon, User, Settings,
} from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ideation Lab', url: '/ideation', icon: Lightbulb },
  { title: 'Planner', url: '/planner', icon: CalendarDays },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

function getInitials(email?: string | null, name?: string | null) {
  if (name) return name.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              CEO Autopilot
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.url;
              return (
                <Link key={item.title} to={item.url} className="relative group">
                  <motion.div
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] transition-colors',
                      active
                        ? 'font-semibold text-foreground'
                        : 'font-medium text-muted-foreground hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <motion.div
                      animate={active ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </motion.div>
                    {item.title}
                  </motion.div>

                  {/* Active glow indicator */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Glow behind active indicator */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        className="absolute bottom-[-2px] left-1/2 h-[6px] w-8 -translate-x-1/2 rounded-full bg-primary/30 blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="rounded-md bg-popover px-2.5 py-1 text-[11px] font-medium text-popover-foreground shadow-md border border-border/50 whitespace-nowrap">
                      {item.title}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Avatar Dropdown (desktop) + Mobile trigger */}
        <div className="flex items-center gap-2">
          {/* Desktop avatar dropdown */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(user?.email, profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    Profil Setup
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" strokeWidth={2} />
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="h-9 w-9">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </motion.div>
              <SheetContent side="right" className="flex w-72 flex-col bg-background">
                <div className="flex items-center gap-2.5 px-1 pb-6 pt-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-[15px] font-semibold tracking-tight text-foreground">
                    CEO Autopilot
                  </span>
                </div>

                <nav className="flex flex-1 flex-col gap-0.5">
                  {navItems.map((item, i) => {
                    const active = location.pathname === item.url;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <Link
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
                      </motion.div>
                    );
                  })}
                  <div className="my-2 h-px bg-border" />
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <User className="h-4 w-4" strokeWidth={2} />
                    Profil Setup
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" strokeWidth={2} />
                    Einstellungen
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
                    Abmelden
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
