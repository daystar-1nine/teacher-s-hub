import { memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
}

// Route title mapping
const routeTitles: Record<string, string> = {
  '/student-dashboard': 'Student Dashboard',
  '/teacher-dashboard': 'Teacher Dashboard',
  '/admin-dashboard': 'Admin Dashboard',
  '/school-admin-dashboard': 'School Admin',
  '/students': 'Students',
  '/attendance': 'Attendance',
  '/exams': 'Examinations',
  '/homework': 'Homework',
  '/explain': 'AI Explain',
  '/question-paper': 'Question Paper',
  '/analytics': 'Analytics',
  '/feedback': 'Feedback',
  '/meet': 'Virtual Class',
  '/classes': 'Classes',
  '/announcements': 'Announcements',
  '/schools': 'Schools',
  '/activity-logs': 'Activity Logs',
  '/health-report': 'Health Report',
  '/settings': 'Settings',
};

export const DashboardHeader = memo(function DashboardHeader({ 
  sidebarCollapsed 
}: DashboardHeaderProps) {
  const { profile, appRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);
  
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  
  const getRoleBadge = () => {
    switch (appRole) {
      case 'admin':
        return { label: 'Admin', variant: 'destructive' as const };
      case 'teacher':
        return { label: 'Teacher', variant: 'default' as const };
      default:
        return { label: 'Student', variant: 'secondary' as const };
    }
  };
  
  const roleBadge = getRoleBadge();

  return (
    <header className={cn(
      "sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg",
      "flex items-center justify-between px-4 lg:px-8 gap-4"
    )}>
      {/* Left Section - Page Title */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-foreground">{currentTitle}</h1>
        </div>
        
        {/* Mobile Title */}
        <div className="lg:hidden pl-12">
          <h1 className="text-lg font-semibold text-foreground">{currentTitle}</h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search anything..." 
            className="pl-9 pr-12 bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Search Button - Mobile */}
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
        </Button>
        
        {/* Command Palette Trigger */}
        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
          <Command className="h-5 w-5" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full animate-pulse" />
        </Button>
        
        {/* Theme Toggle */}
        <ThemeToggle size="sm" className="text-muted-foreground hover:text-foreground" />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-2 hover:bg-muted/50"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {profile?.name?.split(' ')[0] || 'User'}
                </span>
                <Badge variant={roleBadge.variant} className="text-[10px] px-1.5 py-0 h-4">
                  {roleBadge.label}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
