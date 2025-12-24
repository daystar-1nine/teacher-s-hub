import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: ('teacher' | 'student')[];
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['teacher', 'student'] },
  { icon: Users, label: 'Students', href: '/students', roles: ['teacher'] },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['teacher', 'student'] },
  { icon: ClipboardList, label: 'Exams', href: '/exams', roles: ['teacher', 'student'] },
  { icon: BookOpen, label: 'Homework', href: '/homework', roles: ['teacher', 'student'] },
  { icon: Sparkles, label: 'AI Explain', href: '/explain', roles: ['teacher', 'student'] },
  { icon: FileText, label: 'Question Paper', href: '/question-paper', roles: ['teacher'], badge: 'AI' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['teacher'] },
  { icon: MessageSquare, label: 'Feedback', href: '/feedback', roles: ['teacher', 'student'] },
  { icon: Video, label: 'Meet', href: '/meet', roles: ['teacher', 'student'] },
];

// Admin items shown separately
const adminItems: NavItem[] = [
  { icon: GraduationCap, label: 'Classes', href: '/classes', roles: ['teacher'] },
  { icon: BarChart3, label: 'Health Report', href: '/health-report', roles: ['teacher'], badge: 'AI' },
  { icon: Megaphone, label: 'Announcements', href: '/announcements', roles: ['teacher'] },
];

export function Sidebar() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-sidebar-border",
        isCollapsed && "justify-center px-2"
      )}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-glow">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground">Teacher's Desk</span>
            <span className="text-xs text-sidebar-foreground/60">Education Platform</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
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
                  {isActive && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {profile?.role === 'teacher' && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Admin</span>
              </div>
            )}
            {adminItems.map((item) => {
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
                      {isActive && (
                        <ChevronRight className="w-4 h-4" />
                      )}
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
        {!isCollapsed && profile && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {profile.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{profile.role}</p>
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
