import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { 
  Users, 
  CalendarCheck, 
  ClipboardList, 
  BookOpen, 
  MessageSquare,
  Video,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { mockStudents, mockAttendance, mockHomework, mockHomeworkSubmissions, mockExamResults, mockFeedback } from '@/data/mockData';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { RiskAlertPanel } from '@/components/dashboard/RiskAlertPanel';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';

function TeacherDashboard() {
  const { profile } = useAuth();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = mockAttendance.filter(a => a.date === todayDate);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  
  const pendingSubmissions = mockHomeworkSubmissions.filter(s => s.status === 'pending').length;
  const unreadFeedback = mockFeedback.filter(f => !f.isRead).length;

  const stats = [
    { icon: Users, label: 'Total Students', value: mockStudents.length, color: 'bg-primary/10 text-primary', href: '/students' },
    { icon: CalendarCheck, label: 'Present Today', value: presentCount, color: 'bg-success/10 text-success', href: '/attendance' },
    { icon: BookOpen, label: 'Pending Homework', value: pendingSubmissions, color: 'bg-warning/10 text-warning', href: '/homework' },
    { icon: MessageSquare, label: 'New Feedback', value: unreadFeedback, color: 'bg-accent/10 text-accent', href: '/feedback' },
  ];

  const firstName = profile?.name?.split(' ')[0] || 'Teacher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">
              Welcome back, <span className="text-gradient">{firstName}</span>! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your classes today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/meet">
                <Video className="w-4 h-4 mr-2" />
                Start Class
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

      {/* Quick Actions & Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScrollReveal animation="fade-right" delay={100} className="lg:col-span-2">
          <QuickActionsPanel />
        </ScrollReveal>
        <ScrollReveal animation="fade-left" delay={200}>
          <RiskAlertPanel />
        </ScrollReveal>
      </div>

      {/* Recent Activity & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Homework */}
        <ScrollReveal animation="fade-up" delay={100}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Recent Homework
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/homework">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHomework.slice(0, 3).map((hw) => {
                  const submissions = mockHomeworkSubmissions.filter(s => s.homeworkId === hw.id);
                  const submitted = submissions.filter(s => s.status !== 'pending').length;
                  const isOverdue = new Date(hw.dueDate) < new Date();
                  
                  return (
                    <div key={hw.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                      }`}>
                        {isOverdue ? <AlertCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{hw.title}</p>
                        <p className="text-sm text-muted-foreground">{hw.subject} • Due {new Date(hw.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{submitted}/{mockStudents.filter(s => s.className === hw.className).length}</p>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Recent Exam Results */}
        <ScrollReveal animation="fade-up" delay={200}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Recent Exam Results
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/exams">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExamResults.slice(0, 4).map((exam) => {
                  const student = mockStudents.find(s => s.id === exam.studentId);
                  return (
                    <div key={exam.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{student?.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student?.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.subject}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        exam.percentage >= 80 ? 'bg-success/10 text-success' :
                        exam.percentage >= 60 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {exam.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { profile } = useAuth();
  
  const studentExams = mockExamResults.filter(e => e.studentId === 'std-1');
  const averageScore = studentExams.length > 0 
    ? Math.round(studentExams.reduce((sum, e) => sum + e.percentage, 0) / studentExams.length)
    : 0;
  
  const studentAttendance = mockAttendance.filter(a => a.studentId === 'std-1');
  const presentDays = studentAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((presentDays / studentAttendance.length) * 100)
    : 100;
  
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
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">
              Welcome, <span className="text-gradient">{firstName}</span>! 📚
            </h1>
            <p className="text-muted-foreground mt-1">
              Keep up the great work! Here's your progress.
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link to="/meet">
              <Video className="w-4 h-4 mr-2" />
              Join Class
            </Link>
          </Button>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <ScrollRevealGroup 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        animation="scale"
        staggerDelay={80}
      >
        {stats.map((stat) => (
          <Card 
            key={stat.label}
            className="card-hover"
          >
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

      {/* Quick Actions */}
      <ScrollReveal animation="fade-up" delay={100}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
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

      {/* Notifications */}
      <ScrollReveal animation="fade-up" delay={200}>
        <NotificationsPanel />
      </ScrollReveal>

      {/* Upcoming & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Homework */}
        <ScrollReveal animation="fade-right" delay={100}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Homework
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/homework">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHomework.slice(0, 3).map((hw) => {
                  const submission = mockHomeworkSubmissions.find(s => s.homeworkId === hw.id && s.studentId === 'std-1');
                  const daysLeft = Math.ceil((new Date(hw.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={hw.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        submission?.status === 'submitted' ? 'bg-success/10 text-success' :
                        daysLeft < 0 ? 'bg-destructive/10 text-destructive' :
                        daysLeft <= 2 ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {submission?.status === 'submitted' ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{hw.title}</p>
                        <p className="text-sm text-muted-foreground">{hw.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          submission?.status === 'submitted' ? 'text-success' :
                          daysLeft < 0 ? 'text-destructive' :
                          daysLeft <= 2 ? 'text-warning' : ''
                        }`}>
                          {submission?.status === 'submitted' ? 'Done' :
                           daysLeft < 0 ? 'Overdue' :
                           daysLeft === 0 ? 'Today' :
                           `${daysLeft} days`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Recent Results */}
        <ScrollReveal animation="fade-left" delay={200}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Recent Results
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/exams">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentExams.slice(0, 4).map((exam) => (
                  <div key={exam.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      exam.percentage >= 80 ? 'bg-success/10 text-success' :
                      exam.percentage >= 60 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{exam.subject}</p>
                      <p className="text-sm text-muted-foreground">{exam.examName}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exam.percentage >= 80 ? 'bg-success/10 text-success' :
                      exam.percentage >= 60 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {exam.marksObtained}/{exam.totalMarks}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      {profile?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}