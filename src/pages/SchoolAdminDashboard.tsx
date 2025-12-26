import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolAdminData } from '@/hooks/useSchoolAdminData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { InviteTeacherDialog } from '@/components/admin/InviteTeacherDialog';
import { RoleManagementDialog } from '@/components/admin/RoleManagementDialog';
import { cn } from '@/lib/utils';
import { 
  Users, 
  GraduationCap,
  School,
  BarChart3,
  Settings,
  Megaphone,
  BookOpen,
  CalendarCheck,
  Mail,
  UserCog,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

// Memoized stat card for performance
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  color, 
  href 
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  description: string;
  color: string;
  href?: string;
}) {
  const content = (
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {value === null ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
          <p className="text-xs text-muted-foreground/80">{description}</p>
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {href && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            View details <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </CardContent>
  );

  if (href) {
    return (
      <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
        <Link to={href}>{content}</Link>
      </Card>
    );
  }

  return <Card className="overflow-hidden">{content}</Card>;
}

export default function SchoolAdminDashboard() {
  const { profile } = useAuth();
  const { 
    adminProfile,
    teachers, 
    studentsCount, 
    classes, 
    school,
    isLoading,
    deactivateTeacher,
    refetchTeachers,
  } = useSchoolAdminData();

  const firstName = profile?.name?.split(' ')[0] || 'Admin';
  const isSuperAdmin = adminProfile?.is_super_admin ?? false;

  const statCards = [
    { 
      icon: Users, 
      label: 'Teachers', 
      value: isLoading ? null : teachers.length.toString(), 
      description: 'Active in your school', 
      color: 'bg-primary/10 text-primary',
      href: '#teachers',
    },
    { 
      icon: GraduationCap, 
      label: 'Students', 
      value: isLoading ? null : studentsCount.toString(), 
      description: 'Enrolled students', 
      color: 'bg-accent/10 text-accent',
      href: '/students',
    },
    { 
      icon: BookOpen, 
      label: 'Classes', 
      value: isLoading ? null : classes.length.toString(), 
      description: 'Active classes', 
      color: 'bg-success/10 text-success',
      href: '/classes',
    },
    { 
      icon: TrendingUp, 
      label: 'School Code', 
      value: profile?.school_code || '—', 
      description: 'Share with staff', 
      color: 'bg-warning/10 text-warning',
    },
  ];

  const quickActions = [
    { icon: CalendarCheck, label: 'Attendance', href: '/attendance' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Megaphone, label: 'Announcements', href: '/announcements' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Welcome back, <span className="text-gradient">{firstName}</span>
                </h1>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">
                {school?.name || 'Your School'} • School Administration
              </p>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin-dashboard">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Super Admin
                  </Link>
                </Button>
              )}
              <Button variant="default" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <ScrollRevealGroup 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          animation="scale"
          staggerDelay={60}
        >
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </ScrollRevealGroup>

        {/* Quick Actions Bar */}
        <ScrollReveal animation="fade-up" delay={100}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <School className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your school efficiently
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {quickActions.map((action) => (
                  <Button 
                    key={action.label} 
                    variant="outline" 
                    asChild 
                    className="h-auto py-3 flex-col gap-1.5 hover:bg-muted/50 hover:border-primary/30"
                  >
                    <Link to={action.href}>
                      <action.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Link>
                  </Button>
                ))}
                
                <InviteTeacherDialog schoolName={school?.name || 'Your School'}>
                  <Button variant="secondary" className="h-auto py-3 flex-col gap-1.5">
                    <Mail className="w-5 h-5" />
                    <span className="text-xs font-medium">Invite Teacher</span>
                  </Button>
                </InviteTeacherDialog>

                <RoleManagementDialog>
                  <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 hover:bg-muted/50 hover:border-primary/30">
                    <UserCog className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium">Manage Roles</span>
                  </Button>
                </RoleManagementDialog>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Teacher Management Section */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div id="teachers">
            <TeacherManagement
              teachers={teachers}
              isLoading={isLoading}
              schoolName={school?.name || 'Your School'}
              onDeactivate={deactivateTeacher}
              onRefresh={refetchTeachers}
            />
          </div>
        </ScrollReveal>

        {/* School Overview */}
        <ScrollReveal animation="fade-up" delay={300}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">School Name</span>
                    <span className="font-medium">{school?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">School Code</span>
                    <span className="font-mono font-medium">{school?.code || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{school?.email || '—'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{school?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {school?.address || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Admin Role</span>
                    <span className="font-medium capitalize">
                      {adminProfile?.admin_role?.replace('_', ' ') || 'School Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
