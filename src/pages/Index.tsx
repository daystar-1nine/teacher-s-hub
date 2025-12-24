import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  BookOpen,
  Sparkles,
  MessageSquare,
  Video,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  { icon: CalendarCheck, title: 'Attendance', description: 'Daily tracking with reports' },
  { icon: ClipboardList, title: 'Exam Results', description: 'Performance analytics' },
  { icon: BookOpen, title: 'Homework', description: 'Assignment management' },
  { icon: Sparkles, title: 'AI Explain', description: 'Topic explanations' },
  { icon: MessageSquare, title: 'Feedback', description: 'Anonymous & direct' },
  { icon: Video, title: 'Google Meet', description: 'One-click join' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Teacher's Desk</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Education Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight animate-slide-up">
            Your Complete
            <span className="gradient-primary bg-clip-text text-transparent"> Classroom </span>
            Management Solution
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Streamline attendance, homework, exams, and student management with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button size="xl" variant="gradient" asChild>
              <Link to="/auth">
                Start Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Demo: teacher@school.edu / student@school.edu (password: password123)
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Comprehensive tools for teachers and students
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                variant="interactive"
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Built for Modern Education</h2>
              <div className="space-y-4">
                {[
                  'AI-powered topic explanations',
                  'Real-time attendance tracking',
                  'Comprehensive performance analytics',
                  'Anonymous student feedback',
                  'One-click Google Meet integration',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8" variant="gradient" asChild>
                <Link to="/auth">Get Started <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </Card>
              <Card className="p-6 text-center">
                <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </Card>
              <Card className="p-6 text-center col-span-2">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">1000+</p>
                <p className="text-sm text-muted-foreground">AI Explanations Generated</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-semibold">Teacher's Desk</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Teacher's Desk. Built for educators.
          </p>
        </div>
      </footer>
    </div>
  );
}
