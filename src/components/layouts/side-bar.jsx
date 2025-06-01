import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import {
  Home,
  Users,
  Table,
  Database,
  UserCheck,
  CheckSquare,
  User,
  Shield,
  Tag,
  UsersIcon,
  Folder,
  Target,
  PenTool,
  BookOpen,
  Brain,
  ClipboardList,
  UserCog,
  Settings,
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

function SidebarItem({ icon, title, href, isActive }) {
  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'flex w-full items-center justify-start gap-2 px-3',
        isActive ? 'bg-secondary' : 'hover:bg-muted',
      )}
    >
      <Link to={href}>
        {icon}
        <span>{title}</span>
      </Link>
    </Button>
  );
}

export function AppSidebar({ userInfo }) {
  const sidebarItems = [
    {
      icon: <Home className="h-5 w-5" />,
      title: 'Dashboard',
      id: 'dashboard',
      href: '/dashboard',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <Folder className="h-5 w-5" />,
      title: 'Space',
      id: 'space',
      href: '/space',
      roles: ['ANNOTATOR'],
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      title: 'My Tasks',
      id: 'my-tasks',
      href: '/my-tasks',
      roles: ['ANNOTATOR'],
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Datasets',
      id: 'datasets',
      href: '/datasets',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <Tag className="h-5 w-5" />,
      title: 'Labels',
      id: 'labels',
      href: '/labels',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <PenTool className="h-5 w-5" />,
      title: 'Annotators',
      id: 'annotators',
      href: '/annotators',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Teams',
      id: 'teams',
      href: '/teams',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
     icon: <ShieldAlert className="h-5 w-5" />, // ou <Ban className="h-5 w-5" />
     title: 'Blacklist',
     id: 'blacklist',
     href: '/blacklist',
     roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'Train',
      id: 'train',
      href: '/train',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      icon: <UserCog className="h-5 w-5" />,
      title: 'Admins',
      id: 'admin',
      href: '/admins',
      roles: ['SUPER_ADMIN'],
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: 'Admin Tasks',
      id: 'admin-tasks',
      href: '/admin/tasks',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ];

  return (
    <aside
      className={cn(
        'flex fixed   h-screen w-64 flex-col border-r bg-background',
      )}
    >
      <ScrollArea className="flex-1 px-3 py-4 relative">
        <div className="space-y-1">
          {sidebarItems
            .filter(item => item.roles.includes(userInfo.role))
            .map(item => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                href={item.href}
                isActive={window.location.pathname === item.href}
              />
            ))}
        </div>
        <div className="border-t pt-4 absolute bottom-[10%] w-[95%] ">
          <SidebarItem
            icon={<User className="h-5 w-5" />}
            title="Profile"
            href="/profile"
            isActive={window.location.pathname === '/profile'}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
