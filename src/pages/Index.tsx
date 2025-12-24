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
  Zap,
  Brain,
  Shield
} from 'lucide-react';

const features = [
  { icon: CalendarCheck, title: 'Attendance', description: 'Real-time tracking', color: 'neon-purple' },
  { icon: ClipboardList, title: 'Exams', description: 'Performance analytics', color: 'neon-pink' },
  { icon: BookOpen, title: 'Homework', description: 'Smart assignments', color: 'neon-cyan' },
  { icon: Sparkles, title: 'AI Explain', description: 'Instant answers', color: 'neon-green' },
  { icon: MessageSquare, title: 'Feedback', description: 'Anonymous & direct', color: 'neon-orange' },
  { icon: Video, title: 'Live Classes', description: 'One-click join', color: 'neon-yellow' },
];

const stats = [
  { value: '10K+', label: 'Students', icon: Users },
  { value: '500+', label: 'Teachers', icon: GraduationCap },
  { value: '50K+', label: 'AI Queries', icon: Brain },
  { value: '99.9%', label: 'Uptime', icon: Shield },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-soft" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px] animate-pulse-soft delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-cyan/10 blur-[150px] animate-pulse-soft delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">Teacher's Desk</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                Get Started <Zap className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative">
        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-sm font-medium mb-8 animate-bounce-in shadow-glow">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-gradient">AI-Powered Education Platform</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black max-w-5xl mx-auto leading-[1.1] animate-slide-up">
            The Future of
            <span className="block text-gradient-aurora">Classroom</span>
            Management
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mt-8 animate-slide-up delay-100">
            Streamline attendance, homework, exams, and student management with 
            <span className="text-primary font-semibold"> AI-powered insights</span>.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-slide-up delay-200">
            <Button size="xl" variant="gradient" asChild className="group">
              <Link to="/auth" className="flex items-center gap-2">
                Start Free 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="xl" variant="neon-outline" asChild>
              <Link to="/auth">Watch Demo</Link>
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto animate-slide-up delay-300">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="glass rounded-2xl p-6 text-center card-hover"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-black text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Everything You <span className="text-gradient-accent">Need</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Comprehensive tools designed for modern education
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="glass border-border/50 text-center group cursor-pointer card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-black mb-8">
                Built for <span className="text-gradient-cyber">Modern</span> Education
              </h2>
              <div className="space-y-5">
                {[
                  'AI-powered topic explanations in seconds',
                  'Real-time attendance with smart analytics',
                  'Comprehensive performance dashboards',
                  'Anonymous student feedback system',
                  'Integrated video conferencing'
                ].map((item, index) => (
                  <div 
                    key={item} 
                    className="flex items-center gap-4 glass rounded-xl p-4 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                    </div>
                    <span className="text-lg font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-10" size="xl" variant="gradient-aurora" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  Get Started Now 
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            {/* Visual Card Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass p-8 text-center card-hover animate-scale-in delay-100">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-4xl font-black text-gradient">500+</p>
                <p className="text-muted-foreground mt-1">Active Schools</p>
              </Card>
              <Card className="glass p-8 text-center card-hover animate-scale-in delay-200">
                <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
                  <GraduationCap className="w-8 h-8 text-accent-foreground" />
                </div>
                <p className="text-4xl font-black text-gradient-accent">2K+</p>
                <p className="text-muted-foreground mt-1">Teachers</p>
              </Card>
              <Card className="glass p-8 text-center col-span-2 card-hover animate-scale-in delay-300">
                <div className="w-16 h-16 rounded-2xl gradient-cyber flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-black text-gradient-cyber">1M+</p>
                <p className="text-muted-foreground mt-1">AI Explanations Generated</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass rounded-3xl p-12 md:p-16 border border-primary/20 shadow-glow">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
              Ready to <span className="text-gradient">Transform</span> Your Classroom?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of educators already using Teacher's Desk to create better learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="gradient" asChild className="group">
                <Link to="/auth" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="glass" asChild>
                <Link to="/auth">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 glass">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-gradient">Teacher's Desk</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Teacher's Desk. Built with ❤️ for educators.
          </p>
        </div>
      </footer>
    </div>
  );
}