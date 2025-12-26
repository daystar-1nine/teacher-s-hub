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
} from 'lucide-react';

export default function SchoolAdminDashboard() {
  const { profile, user } = useAuth();
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
      description: 'Active teachers in your school', 
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
      description: 'Share with teachers', 
      color: 'bg-warning/10 text-warning',
    },
  ];

  const quickActions = [
    { icon: CalendarCheck, label: 'Attendance', href: '/attendance', description: 'View attendance records' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', description: 'Performance insights' },
    { icon: Megaphone, label: 'Announcements', href: '/announcements', description: 'School-wide messages' },
    { icon: Settings, label: 'Settings', href: '/settings', description: 'School configuration' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground font-display">
                  Welcome, <span className="text-gradient">{firstName}</span>!
                </h1>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground mt-1">
                {school?.name || 'Your School'} — School Admin Dashboard
              </p>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin && (
                <Button variant="outline" asChild>
                  <Link to="/admin-dashboard">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Super Admin
                  </Link>
                </Button>
              )}
              <Button variant="gradient" asChild>
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
          staggerDelay={80}
        >
          {statCards.map((stat) => (
            <Card 
              key={stat.label} 
              variant="interactive"
              className="card-hover"
            >
              {stat.href ? (
                <Link to={stat.href}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        {stat.value === null ? (
                          <Skeleton className="h-9 w-16 mt-1" />
                        ) : (
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      {stat.value === null ? (
                        <Skeleton className="h-9 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold mt-1 font-mono">{stat.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </ScrollRevealGroup>

        {/* Quick Actions */}
        <ScrollReveal animation="fade-up" delay={100}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                School Admin Actions
              </CardTitle>
              <CardDescription>
                Quick access to school management features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {quickActions.map((action) => (
                  <Button key={action.label} variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                    <Link to={action.href}>
                      <action.icon className="w-5 h-5" />
                      <span className="text-sm">{action.label}</span>
                    </Link>
                  </Button>
                ))}
                
                {/* Invite Teacher Button */}
                <InviteTeacherDialog schoolName={school?.name || 'Your School'}>
                  <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">Invite Teacher</span>
                  </Button>
                </InviteTeacherDialog>

                {/* Role Management Button */}
                <RoleManagementDialog>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <UserCog className="w-5 h-5" />
                    <span className="text-sm">Manage Roles</span>
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
