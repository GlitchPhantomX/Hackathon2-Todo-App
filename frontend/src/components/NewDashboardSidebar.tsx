'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  CalendarIcon,
  BarChartIcon,
  SettingsIcon,
  UserIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  FlagIcon,
  TagIcon,
  ListTodoIcon,
  CalendarDaysIcon,
  BellIcon,
  LucideIcon,
  XIcon,
} from 'lucide-react';

interface SubItem {
  title: string;
  href: string;
  iconColor?: string | undefined;
}

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  badge?: number | undefined;
  expandable?: boolean | undefined;
  expanded?: boolean | undefined;
  onToggle?: (() => void) | undefined;
  subItems?: SubItem[] | undefined;
}

interface BottomNavItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface NewDashboardSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NewDashboardSidebar = ({ isMobileOpen = false, onMobileClose }: NewDashboardSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    projects: false,
    priorities: false,
  });

  const pathname = usePathname();
  const router = useRouter();
  const { stats } = useDashboard();
  const { logout } = useAuth();

  const basePath = pathname === '/new-dashboard' || pathname.startsWith('/new-dashboard/') ? '/new-dashboard' : '';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const constructRoute = (path: string) => {
    if (path.startsWith('/')) {
      if (basePath && !path.startsWith(basePath)) {
        return `${basePath}${path}`;
      }
      return path;
    }
    return basePath ? `${basePath}/${path}` : path;
  };

  const isActive = (path: string) => {
    const fullRoute = constructRoute(path);
    return pathname === fullRoute || pathname.startsWith(fullRoute + '?');
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    router.push("/login");
  };

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/new-dashboard',
    },
    {
      title: 'My Tasks',
      icon: ListTodoIcon,
      href: '/new-dashboard/tasks',
      expandable: true,
      expanded: expandedSections.tasks ?? false,
      onToggle: () => toggleSection('tasks'),
      subItems: [
        { title: 'All', href: '/new-dashboard/tasks' },
        { title: 'Completed', href: '/new-dashboard/tasks/completed' },
        { title: 'Pending', href: '/new-dashboard/tasks/pending' },
      ]
    },
    {
      title: 'Today',
      icon: CalendarDaysIcon,
      href: '/new-dashboard/today',
      badge: stats.pending ?? 0,
    },
    {
      title: 'Upcoming',
      icon: CalendarIcon,
      href: '/new-dashboard/upcoming',
      badge: stats.pending ?? 0,
    },
    {
      title: 'Projects',
      icon: FolderIcon,
      href: '/new-dashboard/projects',
      expandable: true,
      expanded: expandedSections.projects ?? false,
      onToggle: () => toggleSection('projects'),
      subItems: [
        { title: 'Work', href: '/new-dashboard/projects/work' },
        { title: 'Personal', href: '/new-dashboard/projects/personal' },
        { title: 'Study', href: '/new-dashboard/projects/study' },
      ]
    },
    {
      title: 'Priorities',
      icon: FlagIcon,
      href: '/new-dashboard/priorities',
      expandable: true,
      expanded: expandedSections.priorities ?? false,
      onToggle: () => toggleSection('priorities'),
      subItems: [
        { title: 'High', href: '/new-dashboard/priorities/high', iconColor: 'text-red-500' },
        { title: 'Medium', href: '/new-dashboard/priorities/medium', iconColor: 'text-yellow-500' },
        { title: 'Low', href: '/new-dashboard/priorities/low', iconColor: 'text-blue-500' },
      ]
    },
    {
      title: 'Tags',
      icon: TagIcon,
      href: '/new-dashboard/tags',
    },
    {
      title: 'Statistics',
      icon: BarChartIcon,
      href: '/new-dashboard/statistics',
    },
    {
      title: 'Reminders',
      icon: BellIcon,
      href: '/new-dashboard/reminders',
    },
  ];

  const bottomNavItems: BottomNavItem[] = [
    {
      title: 'Profile',
      icon: UserIcon,
      href: '/new-dashboard/profile',
    },
    {
      title: 'Settings',
      icon: SettingsIcon,
      href: '/new-dashboard/settings',
    },
    {
      title: 'Help',
      icon: HelpCircleIcon,
      href: '/new-dashboard/help',
    },
    {
      title: 'Logout',
      icon: LogOutIcon,
      onClick: handleLogout,
    },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div 
        className="flex h-16 items-center border-b px-4 justify-between flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded && (
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="h-6 w-6 flex-shrink-0 rounded"
                style={{
                  background: 'linear-gradient(to right, var(--purple-500), var(--violet-500))'
                }}
              />
              <span 
                className="text-lg font-semibold truncate"
                style={{ color: 'var(--foreground)' }}
              >
                TodoMaster
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle button for desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:flex h-8 w-8 flex-shrink-0"
          style={{ color: 'var(--muted-foreground)' }}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>

        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="md:hidden h-8 w-8 flex-shrink-0"
        >
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.expandable ? (
                <div>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className={`w-full ${isExpanded ? 'justify-start' : 'justify-center px-2'}`}
                    onClick={item.onToggle}
                    style={{
                      color: isActive(item.href) ? 'var(--primary)' : 'var(--foreground)',
                      backgroundColor: isActive(item.href) ? 'var(--muted)' : 'transparent'
                    }}
                    title={!isExpanded ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="ml-2 flex-1 text-left">{item.title}</span>
                        {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="ml-auto"
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'white'
                            }}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.expanded ? (
                          <ChevronRightIcon className="ml-auto h-4 w-4 transform rotate-90" />
                        ) : (
                          <ChevronRightIcon className="ml-auto h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                  {isExpanded && item.expanded && item.subItems && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.title}>
                          <Button
                            variant={isActive(subItem.href) ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-sm"
                            asChild
                            style={{
                              color: isActive(subItem.href) ? 'var(--primary)' : 'var(--foreground)',
                              backgroundColor: isActive(subItem.href) ? 'var(--muted)' : 'transparent'
                            }}
                          >
                            <Link href={constructRoute(subItem.href)}>
                              {subItem.iconColor && (
                                <FlagIcon className={`h-3 w-3 ${subItem.iconColor}`} />
                              )}
                              <span className={subItem.iconColor ? 'ml-2' : ''}>
                                {subItem.title}
                              </span>
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={`w-full ${isExpanded ? 'justify-start' : 'justify-center px-2'}`}
                  asChild
                  style={{
                    color: isActive(item.href) ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: isActive(item.href) ? 'var(--muted)' : 'transparent'
                  }}
                  title={!isExpanded ? item.title : undefined}
                >
                  <Link href={constructRoute(item.href)}>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="ml-2 flex-1">{item.title}</span>
                        {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="ml-auto"
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'white'
                            }}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div 
        className="border-t p-2 flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.title}>
              {item.onClick ? (
                <Button
                  variant={item.title === 'Logout' ? 'ghost' : (isActive(item.href || '') ? 'secondary' : 'ghost')}
                  className={`w-full ${isExpanded ? 'justify-start' : 'justify-center px-2'} ${
                    item.title === 'Logout' ? 'text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950' : ''
                  }`}
                  onClick={item.onClick}
                  style={{
                    color: item.title === 'Logout' ? '#dc2626' : (isActive(item.href || '') ? 'var(--primary)' : 'var(--foreground)'),
                    backgroundColor: isActive(item.href || '') ? 'var(--muted)' : 'transparent'
                  }}
                  title={!isExpanded ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {isExpanded && <span className="ml-2">{item.title}</span>}
                </Button>
              ) : (
                <Button
                  variant={isActive(item.href || '') ? 'secondary' : 'ghost'}
                  className={`w-full ${isExpanded ? 'justify-start' : 'justify-center px-2'}`}
                  asChild
                  style={{
                    color: isActive(item.href || '') ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: isActive(item.href || '') ? 'var(--muted)' : 'transparent'
                  }}
                  title={!isExpanded ? item.title : undefined}
                >
                  <Link href={constructRoute(item.href || '')}>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {isExpanded && <span className="ml-2">{item.title}</span>}
                  </Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex h-screen sticky top-0 z-30 flex-col border-r transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)'
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)'
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default NewDashboardSidebar;