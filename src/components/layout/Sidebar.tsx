import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Video,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  GraduationCap,
  BarChart3,
  FileText,
  Megaphone,
  Settings,
  Activity,
  Shield,
  School,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: AppRole[];
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Student navigation
const studentNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/student-dashboard', roles: ['student'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['student'] },
      { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['student'] },
      { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['student'] },
    ],
  },
  {
    title: 'Tools',
    items: [
      { icon: Sparkles, label: 'AI Explain', href: '/explain', roles: ['student'], badge: 'AI' },
      { icon: Video, label: 'Join Class', href: '/meet', roles: ['student'] },
      { icon: MessageSquare, label: 'Feedback', href: '/feedback', roles: ['student'] },
    ],
  },
];

// Teacher navigation
const teacherNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher-dashboard', roles: ['teacher'] },
      { icon: Users, label: 'Students', href: '/students', roles: ['teacher'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['teacher'] },
      { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['teacher'] },
      { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['teacher'] },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { icon: Sparkles, label: 'AI Explain', href: '/explain', roles: ['teacher'], badge: 'AI' },
      { icon: FileText, label: 'Question Paper', href: '/question-paper', roles: ['teacher'], badge: 'AI' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { icon: Video, label: 'Start Class', href: '/meet', roles: ['teacher'] },
      { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['teacher'] },
      { icon: MessageSquare, label: 'Feedback', href: '/feedback', roles: ['teacher'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: GraduationCap, label: 'Classes', href: '/classes', roles: ['teacher'] },
      { icon: Megaphone, label: 'Announcements', href: '/announcements', roles: ['teacher'] },
    ],
  },
];

// Admin navigation
const adminNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard', roles: ['admin'] },
      { icon: ShieldCheck, label: 'School Admin', href: '/school-admin-dashboard', roles: ['admin'] },
    ],
  },
  {
    title: 'Users & Classes',
    items: [
      { icon: Users, label: 'All Users', href: '/students', roles: ['admin'] },
      { icon: GraduationCap, label: 'Classes', href: '/classes', roles: ['admin'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['admin'] },
      { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['admin'] },
      { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['admin'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['admin'] },
      { icon: Megaphone, label: 'Announcements', href: '/announcements', roles: ['admin'] },
    ],
  },
  {
    title: 'Admin Tools',
    items: [
      { icon: School, label: 'Schools', href: '/schools', roles: ['admin'] },
      { icon: Activity, label: 'Activity Logs', href: '/activity-logs', roles: ['admin'] },
      { icon: Shield, label: 'Health Report', href: '/health-report', roles: ['admin'], badge: 'AI' },
      { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin'] },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

interface AdminProfile {
  name: string;
  is_super_admin: boolean;
}

// Memoized nav item component
const NavItemComponent = memo(function NavItemComponent({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const content = (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isCollapsed && "justify-center px-2"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
        !isActive && "group-hover:scale-110"
      )} />
      {!isCollapsed && (
        <>
          <span className="font-medium text-sm flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0",
              item.badge === 'AI' ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground"
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-r-full" />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-accent text-accent-foreground">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const { profile, appRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  // Check admin status via server-side RPC
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_profile');
        if (!error && data && data.length > 0 && data[0].is_active) {
          setIsVerifiedAdmin(true);
          setAdminProfile({ name: data[0].name, is_super_admin: data[0].is_super_admin });
        } else {
          setIsVerifiedAdmin(false);
          setAdminProfile(null);
        }
      } catch {
        setIsVerifiedAdmin(false);
        setAdminProfile(null);
      }
    };
    checkAdminStatus();
  }, []);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  // Get navigation groups based on role
  const getNavGroups = (): NavGroup[] => {
    if (isVerifiedAdmin) return adminNavGroups;
    switch (appRole) {
      case 'teacher': return teacherNavGroups;
      case 'student':
      default: return studentNavGroups;
    }
  };

  const navGroups = getNavGroups();
  const displayName = isVerifiedAdmin && adminProfile ? adminProfile.name : profile?.name;
  const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-sidebar-border flex-shrink-0",
        isCollapsed && "justify-center px-2"
      )}>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl shadow-glow flex-shrink-0",
          isVerifiedAdmin ? "bg-destructive" : "gradient-primary"
        )}>
          {isVerifiedAdmin ? (
            <Shield className="w-5 h-5 text-destructive-foreground" />
          ) : (
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base text-sidebar-foreground truncate">
              {isVerifiedAdmin ? "Admin Portal" : "Teacher's Desk"}
            </span>
            <span className="text-[11px] text-sidebar-foreground/50 truncate">
              {profile?.school_code || 'Education'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navGroups.map((group, idx) => (
            <div key={group.title}>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
              )}
              {isCollapsed && idx > 0 && (
                <div className="h-px bg-sidebar-border mx-2 mb-2" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    isActive={location.pathname === item.href}
                    isCollapsed={isCollapsed}
                    onClick={closeMobile}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        "border-t border-sidebar-border p-3 flex-shrink-0",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
              isVerifiedAdmin ? "bg-destructive/20" : "bg-sidebar-accent"
            )}>
              <span className={cn(
                "text-sm font-semibold",
                isVerifiedAdmin ? "text-destructive" : "text-sidebar-foreground"
              )}>
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">{profile?.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            !isCollapsed && "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => onCollapsedChange(!isCollapsed)}
        className={cn(
          "hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-primary text-primary-foreground items-center justify-center",
          "shadow-md hover:scale-110 transition-all duration-200 z-10"
        )}
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-200",
          isCollapsed && "rotate-180"
        )} />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-card shadow-card border border-border"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-full w-72 bg-sidebar z-50",
        "transform transition-transform duration-300 ease-out shadow-xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={closeMobile}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-full bg-sidebar z-40",
        "flex-col transition-all duration-300 ease-out border-r border-sidebar-border",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
