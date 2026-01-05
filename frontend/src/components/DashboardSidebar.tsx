'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
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
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FlagIcon,
  TagIcon,
  ListTodoIcon,
  CalendarDaysIcon,
  BellIcon,
  LucideIcon,
} from 'lucide-react';

// Define proper TypeScript interfaces with exact optional property types
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
  href: string;
}

const DashboardSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    projects: false,
    priorities: false,
  });

  const pathname = usePathname();
  const { stats } = useDashboard();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => pathname === path;

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/new-dashboard',
    },
    {
      title: 'My Tasks',
      icon: ListTodoIcon,
      href: '/tasks',
      expandable: true,
      expanded: expandedSections.tasks ?? false,
      onToggle: () => toggleSection('tasks'),
      subItems: [
        { title: 'All', href: '/tasks' },
        { title: 'Completed', href: '/tasks?status=completed' },
        { title: 'Pending', href: '/tasks?status=pending' },
      ]
    },
    {
      title: 'Today',
      icon: CalendarDaysIcon,
      href: '/today',
      badge: stats.pending ?? 0, // Assuming this represents tasks due today
    },
    {
      title: 'Upcoming',
      icon: CalendarIcon,
      href: '/upcoming',
      badge: stats.pending ?? 0, // Assuming this represents upcoming tasks
    },
    {
      title: 'Projects',
      icon: FolderIcon,
      href: '/projects',
      expandable: true,
      expanded: expandedSections.projects ?? false,
      onToggle: () => toggleSection('projects'),
      subItems: [
        { title: 'Work', href: '/projects/work' },
        { title: 'Personal', href: '/projects/personal' },
        { title: 'Study', href: '/projects/study' },
      ]
    },
    {
      title: 'Priorities',
      icon: FlagIcon,
      href: '/priorities',
      expandable: true,
      expanded: expandedSections.priorities ?? false,
      onToggle: () => toggleSection('priorities'),
      subItems: [
        { title: 'High', href: '/priorities/high', iconColor: 'text-red-500' },
        { title: 'Medium', href: '/priorities/medium', iconColor: 'text-yellow-500' },
        { title: 'Low', href: '/priorities/low', iconColor: 'text-blue-500' },
      ]
    },
    {
      title: 'Tags',
      icon: TagIcon,
      href: '/tags',
    },
    {
      title: 'Statistics',
      icon: BarChartIcon,
      href: '/statistics',
    },
    {
      title: 'Reminders',
      icon: BellIcon,
      href: '/reminders',
    },
  ];

  const bottomNavItems: BottomNavItem[] = [
    {
      title: 'Profile',
      icon: UserIcon,
      href: '/profile',
    },
    {
      title: 'Settings',
      icon: SettingsIcon,
      href: '/new-dashboard/settings',
    },
    {
      title: 'Help',
      icon: HelpCircleIcon,
      href: '/help',
    },
    {
      title: 'Logout',
      icon: LogOutIcon,
      href: '/logout',
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 z-30 hidden md:flex flex-col border-r bg-background transition-all duration-300 ${
        isExpanded ? 'w-72' : 'w-18'
      }`}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {isExpanded && (
          <div className="flex items-center gap-2 ml-2">
            <div className="h-6 w-6 rounded bg-linear-to-r from-purple-500 to-indigo-500" />
            <span className="text-lg font-semibold">TodoPro</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.expandable ? (
                <div>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${!isExpanded ? 'justify-center' : ''}`}
                    onClick={item.onToggle}
                  >
                    <item.icon className="h-4 w-4" />
                    {isExpanded && (
                      <>
                        <span className="ml-2">{item.title}</span>
                        {item.badge !== undefined && item.badge !== null && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                        {item.expanded ? (
                          <ChevronDownIcon className="ml-auto h-4 w-4" />
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
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href={subItem.href}>
                              {subItem.iconColor && (
                                <FlagIcon className={`h-4 w-4 ${subItem.iconColor}`} />
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
                  className={`w-full justify-start ${!isExpanded ? 'justify-center' : ''}`}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {isExpanded && (
                      <>
                        <span className="ml-2">{item.title}</span>
                        {item.badge !== undefined && item.badge !== null && (
                          <Badge variant="secondary" className="ml-auto">
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

      <div className="border-t p-2">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.title}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${!isExpanded ? 'justify-center' : ''}`}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {isExpanded && <span className="ml-2">{item.title}</span>}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default DashboardSidebar;