import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { RiskAlertPanel } from '@/components/dashboard/RiskAlertPanel';
import { 
  Users, CalendarCheck, BookOpen, MessageSquare, Video, BarChart3
} from 'lucide-react';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const { studentsQuery, homeworkQuery, feedbackQuery } = useRoleBasedData();
  
  const students = studentsQuery.data || [];
  const homework = homeworkQuery.data || [];
  const feedback = feedbackQuery.data || [];

  const pendingHomework = homework.filter(h => new Date(h.due_date) > new Date()).length;
  const unreadFeedback = feedback.filter(f => !f.is_read && f.type === 'anonymous').length;

  const stats = [
    { icon: Users, label: 'Total Students', value: students.length, color: 'bg-primary/10 text-primary', href: '/students' },
    { icon: CalendarCheck, label: 'Active Classes', value: [...new Set(students.map(s => s.class_name))].length, color: 'bg-success/10 text-success', href: '/attendance' },
    { icon: BookOpen, label: 'Active Homework', value: pendingHomework, color: 'bg-warning/10 text-warning', href: '/homework' },
    { icon: MessageSquare, label: 'New Feedback', value: unreadFeedback, color: 'bg-accent/10 text-accent', href: '/feedback' },
  ];

  const firstName = profile?.name?.split(' ')[0] || 'Teacher';

  const isLoading = studentsQuery.isLoading || homeworkQuery.isLoading || feedbackQuery.isLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">
                Welcome back, <span className="text-gradient">{firstName}</span>! 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild><Link to="/analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</Link></Button>
              <Button variant="gradient" asChild><Link to="/meet"><Video className="w-4 h-4 mr-2" />Start Class</Link></Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" animation="scale" staggerDelay={80}>
          {stats.map((stat) => (
            <Card key={stat.label} variant="interactive" className="card-hover">
              <Link to={stat.href}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </ScrollRevealGroup>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScrollReveal animation="fade-right" delay={100} className="lg:col-span-2"><QuickActionsPanel /></ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}><RiskAlertPanel /></ScrollReveal>
        </div>
      </div>
    </DashboardLayout>
  );
}
