import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { 
  TrendingUp, CalendarCheck, Clock, CheckCircle2, Video, ClipboardList, 
  BookOpen, Sparkles, ArrowRight, AlertCircle
} from 'lucide-react';
import { mockAttendance, mockHomework, mockHomeworkSubmissions, mockExamResults } from '@/data/mockData';

export default function StudentDashboard() {
  const { profile } = useAuth();
  
  const studentExams = mockExamResults.filter(e => e.studentId === 'std-1');
  const averageScore = studentExams.length > 0 
    ? Math.round(studentExams.reduce((sum, e) => sum + e.percentage, 0) / studentExams.length) : 0;
  
  const studentAttendance = mockAttendance.filter(a => a.studentId === 'std-1');
  const presentDays = studentAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((presentDays / studentAttendance.length) * 100) : 100;
  
  const pendingHomework = mockHomeworkSubmissions.filter(s => s.studentId === 'std-1' && s.status === 'pending').length;

  const stats = [
    { icon: TrendingUp, label: 'Average Score', value: `${averageScore}%`, color: 'bg-primary/10 text-primary' },
    { icon: CalendarCheck, label: 'Attendance', value: `${attendanceRate}%`, color: 'bg-success/10 text-success' },
    { icon: Clock, label: 'Pending Tasks', value: pendingHomework, color: 'bg-warning/10 text-warning' },
    { icon: CheckCircle2, label: 'Completed', value: mockHomeworkSubmissions.filter(s => s.studentId === 'std-1' && s.status !== 'pending').length, color: 'bg-accent/10 text-accent' },
  ];

  const quickActions = [
    { icon: CalendarCheck, label: 'View Attendance', href: '/attendance', variant: 'default' as const },
    { icon: ClipboardList, label: 'My Exams', href: '/exams', variant: 'secondary' as const },
    { icon: BookOpen, label: 'Homework', href: '/homework', variant: 'secondary' as const },
    { icon: Sparkles, label: 'Learn Topic', href: '/explain', variant: 'gradient' as const },
  ];

  const firstName = profile?.name?.split(' ')[0] || 'Student';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">
                Welcome, <span className="text-gradient">{firstName}</span>! 📚
              </h1>
              <p className="text-muted-foreground mt-1">Keep up the great work! Here's your progress.</p>
            </div>
            <Button variant="gradient" asChild>
              <Link to="/meet"><Video className="w-4 h-4 mr-2" />Join Class</Link>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4" animation="scale" staggerDelay={80}>
          {stats.map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollRevealGroup>

        <ScrollReveal animation="fade-up" delay={100}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Button key={action.label} variant={action.variant} asChild className="h-auto py-4 flex-col gap-2">
                    <Link to={action.href}><action.icon className="w-5 h-5" /><span className="text-sm">{action.label}</span></Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200}><NotificationsPanel /></ScrollReveal>
      </div>
    </DashboardLayout>
  );
}