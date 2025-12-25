import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { 
  Users, 
  GraduationCap,
  Settings,
  Shield,
  BarChart3,
  Activity,
  Megaphone,
  FileText,
  UserPlus,
  School,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();

  const stats = [
    { icon: Users, label: 'Total Users', value: '156', change: '+12 this month', color: 'bg-primary/10 text-primary' },
    { icon: GraduationCap, label: 'Active Classes', value: '24', change: '8 sections', color: 'bg-accent/10 text-accent' },
    { icon: CheckCircle2, label: 'Attendance Rate', value: '94%', change: '+2% from last week', color: 'bg-success/10 text-success' },
    { icon: TrendingUp, label: 'Avg. Performance', value: '78%', change: '+5% improvement', color: 'bg-warning/10 text-warning' },
  ];

  const quickActions = [
    { icon: School, label: 'Manage Schools', href: '/schools', variant: 'default' as const },
    { icon: UserPlus, label: 'Add Teacher', href: '/students', variant: 'secondary' as const },
    { icon: GraduationCap, label: 'Manage Classes', href: '/classes', variant: 'secondary' as const },
    { icon: Megaphone, label: 'Announcements', href: '/announcements', variant: 'outline' as const },
  ];

  const recentActivity = [
    { icon: UserPlus, text: 'New teacher Priya Sharma joined', time: '2 hours ago', type: 'success' },
    { icon: AlertTriangle, text: 'Class 10B attendance below 80%', time: '5 hours ago', type: 'warning' },
    { icon: FileText, text: 'Monthly health report generated', time: '1 day ago', type: 'info' },
    { icon: Shield, text: 'Security settings updated', time: '2 days ago', type: 'info' },
  ];

  const firstName = profile?.name?.split(' ')[0] || 'Admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">
                Welcome, <span className="text-gradient">{firstName}</span>! 🛡️
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your school from this admin dashboard.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/health-report">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Health Report
                </Link>
              </Button>
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
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              variant="interactive"
              className="card-hover"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollRevealGroup>

        {/* Quick Actions */}
        <ScrollReveal animation="fade-up" delay={100}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Admin Quick Actions
              </CardTitle>
              <CardDescription>
                Manage teachers, classes, and school settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Button key={action.label} variant={action.variant} asChild className="h-auto py-4 flex-col gap-2">
                    <Link to={action.href}>
                      <action.icon className="w-5 h-5" />
                      <span className="text-sm">{action.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <ScrollReveal animation="fade-right" delay={100}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/activity-logs">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'success' ? 'bg-success/10 text-success' :
                        activity.type === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* School Overview */}
          <ScrollReveal animation="fade-left" delay={200}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5 text-primary" />
                  School Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-accent">144</p>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-success">8</p>
                    <p className="text-sm text-muted-foreground">Classes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-warning">15</p>
                    <p className="text-sm text-muted-foreground">Subjects</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">School Code</span>
                    <span className="font-mono font-medium">{profile?.school_code || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Academic Year</span>
                    <span className="font-medium">{new Date().getFullYear()}-{(new Date().getFullYear() + 1).toString().slice(-2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Admin Tools */}
        <ScrollReveal animation="fade-up" delay={300}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Admin Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/schools" className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group">
                  <School className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">School Management</h3>
                  <p className="text-sm text-muted-foreground">Create & manage schools</p>
                </Link>
                <Link to="/activity-logs" className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group">
                  <Activity className="w-8 h-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">Activity Logs</h3>
                  <p className="text-sm text-muted-foreground">View all system activities</p>
                </Link>
                <Link to="/health-report" className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group">
                  <BarChart3 className="w-8 h-8 text-success mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">Health Report</h3>
                  <p className="text-sm text-muted-foreground">AI-generated insights</p>
                </Link>
                <Link to="/settings" className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group">
                  <Settings className="w-8 h-8 text-warning mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">School Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure your school</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}