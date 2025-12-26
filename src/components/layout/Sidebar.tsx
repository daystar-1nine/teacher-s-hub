import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  ChevronRight,
  GraduationCap,
  BarChart3,
  FileText,
  Command,
  Megaphone,
  Settings,
  Activity,
  Shield,
  School,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: AppRole[];
  badge?: string;
}

// Student navigation items
const studentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student-dashboard', roles: ['student'] },
  { icon: CalendarCheck, label: 'My Attendance', href: '/attendance', roles: ['student'] },
  { icon: ClipboardList, label: 'My Exams', href: '/exams', roles: ['student'] },
  { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['student'] },
  { icon: Sparkles, label: 'AI Explain', href: '/explain', roles: ['student'], badge: 'AI' },
  { icon: MessageSquare, label: 'Feedback', href: '/feedback', roles: ['student'] },
  { icon: Video, label: 'Join Class', href: '/meet', roles: ['student'] },
];

// Teacher navigation items
const teacherNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher-dashboard', roles: ['teacher'] },
  { icon: Users, label: 'Students', href: '/students', roles: ['teacher'] },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['teacher'] },
  { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['teacher'] },
  { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['teacher'] },
  { icon: Sparkles, label: 'AI Explain', href: '/explain', roles: ['teacher'], badge: 'AI' },
  { icon: FileText, label: 'Question Paper', href: '/question-paper', roles: ['teacher'], badge: 'AI' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['teacher'] },
  { icon: MessageSquare, label: 'Feedback', href: '/feedback', roles: ['teacher'] },
  { icon: Video, label: 'Start Class', href: '/meet', roles: ['teacher'] },
];

// Teacher admin section
const teacherAdminItems: NavItem[] = [
  { icon: GraduationCap, label: 'Classes', href: '/classes', roles: ['teacher'] },
  { icon: Megaphone, label: 'Announcements', href: '/announcements', roles: ['teacher'] },
];

// Admin navigation items - ISOLATED from teacher/student
const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard', roles: ['admin'] },
  { icon: Users, label: 'All Users', href: '/students', roles: ['admin'] },
  { icon: GraduationCap, label: 'Classes', href: '/classes', roles: ['admin'] },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['admin'] },
  { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['admin'] },
  { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['admin'] },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['admin'] },
  { icon: Megaphone, label: 'Announcements', href: '/announcements', roles: ['admin'] },
];

// Admin tools section - ADMIN ONLY (verified via server-side check)
const adminToolItems: NavItem[] = [
  { icon: School, label: 'Schools', href: '/schools', roles: ['admin'] },
  { icon: Activity, label: 'Activity Logs', href: '/activity-logs', roles: ['admin'] },
  { icon: Shield, label: 'Health Report', href: '/health-report', roles: ['admin'], badge: 'AI' },
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin'] },
];

interface AdminProfile {
  name: string;
  is_super_admin: boolean;
}

export function Sidebar() {
  const { profile, appRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Server-side verified admin status
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  // Check admin status via server-side RPC on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_profile');
        if (!error && data && data.length > 0 && data[0].is_active) {
          setIsVerifiedAdmin(true);
          setAdminProfile({
            name: data[0].name,
            is_super_admin: data[0].is_super_admin,
          });
        } else {
          setIsVerifiedAdmin(false);
          setAdminProfile(null);
        }
      } catch (error) {
        setIsVerifiedAdmin(false);
        setAdminProfile(null);
      }
    };

    checkAdminStatus();
  }, []);

  // Get navigation items based on role
  // SECURITY: Admin items only shown if server-side verified
  const getNavItems = (): NavItem[] => {
    if (isVerifiedAdmin) {
      return adminNavItems;
    }
    switch (appRole) {
      case 'teacher':
        return teacherNavItems;
      case 'student':
      default:
        return studentNavItems;
    }
  };

  const getAdminSectionItems = (): NavItem[] => {
    // SECURITY: Only show admin tools if server-side verified as admin
    if (isVerifiedAdmin) {
      return adminToolItems;
    }
    if (appRole === 'teacher') {
      return teacherAdminItems;
    }
    return [];
  };

  const navItems = getNavItems();
  const adminSectionItems = getAdminSectionItems();

  const getRoleBadge = () => {
    // Use server-verified admin status
    if (isVerifiedAdmin) {
      return { 
        label: adminProfile?.is_super_admin ? 'Super Admin' : 'Admin', 
        color: 'bg-destructive/10 text-destructive' 
      };
    }
    switch (appRole) {
      case 'teacher':
        return { label: 'Teacher', color: 'bg-primary/10 text-primary' };
      case 'student':
      default:
        return { label: 'Student', color: 'bg-accent/10 text-accent' };
    }
  };

  const roleBadge = getRoleBadge();

  // Display name - use admin profile name if verified admin
  const displayName = isVerifiedAdmin && adminProfile ? adminProfile.name : profile?.name;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-sidebar-border",
        isCollapsed && "justify-center px-2"
      )}>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl shadow-glow",
          isVerifiedAdmin ? "bg-destructive" : "gradient-primary"
        )}>
          {isVerifiedAdmin ? (
            <Shield className="w-6 h-6 text-destructive-foreground" />
          ) : (
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground">
              {isVerifiedAdmin ? "Admin Portal" : "Teacher's Desk"}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {isVerifiedAdmin ? "Administration" : "Education Platform"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                      item.badge === 'AI' ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </Link>
          );
        })}

        {/* Admin/Tools Section */}
        {adminSectionItems.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  {appRole === 'admin' ? 'Admin Tools' : 'Management'}
                </span>
              </div>
            )}
            {adminSectionItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                          item.badge === 'AI' ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </Link>
              );
            })}
          </>
        )}
        
        {/* Keyboard shortcut hint */}
        {!isCollapsed && (
          <div className="mt-4 px-3 py-2 text-xs text-sidebar-foreground/50 flex items-center gap-2">
            <Command className="w-3 h-3" />
            <span>Press <kbd className="px-1 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground text-[10px]">⌘K</kbd> for quick access</span>
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className={cn(
        "border-t border-sidebar-border p-4",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed && (profile || adminProfile) && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isVerifiedAdmin ? "bg-destructive/20" : "bg-sidebar-accent"
            )}>
              <span className={cn(
                "text-sm font-semibold",
                isVerifiedAdmin ? "text-destructive" : "text-sidebar-foreground"
              )}>
                {displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", roleBadge.color)}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        )}
        <div className={cn(
          "flex gap-2",
          isCollapsed ? "flex-col items-center" : "items-center"
        )}>
          <ThemeToggle size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
          <Button
            variant="ghost"
            className={cn(
              "flex-1 justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "justify-center px-2 flex-none"
            )}
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-md hover:scale-110 transition-transform"
      >
        <ChevronRight className={cn(
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-card"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block fixed left-0 top-0 h-full bg-sidebar z-40 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <NavContent />
      </aside>
    </>
  );
}