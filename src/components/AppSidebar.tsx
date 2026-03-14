import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Lightbulb, CalendarDays, BarChart3, Settings, Zap, LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Profil Setup', url: '/profile', icon: User },
  { title: 'Ideation Lab', url: '/ideation', icon: Lightbulb },
  { title: 'Content Planner', url: '/planner', icon: CalendarDays },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Einstellungen', url: '/settings', icon: Settings },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
            <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-playfair text-sm font-semibold text-sidebar-primary">CEO Autopilot</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">LinkedIn</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`}
                        activeClassName=""
                      >
                        {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-sidebar-primary" />}
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 truncate text-xs text-sidebar-foreground/70">{user.email}</div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-xs">Abmelden</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
