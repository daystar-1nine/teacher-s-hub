import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Feedback } from '@/types';
import { mockFeedback, mockStudents } from '@/data/mockData';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  User,
  Clock,
  CheckCircle2,
  MessageCircle,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

export default function FeedbackPage() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useLocalStorage<Feedback[]>('feedback_records', mockFeedback);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');

  const isTeacher = profile?.role === 'teacher';

  const anonymousFeedback = feedback.filter(f => f.type === 'anonymous');
  const teacherFeedbackList = feedback.filter(f => f.type === 'teacher');
  const myFeedback = feedback.filter(f => 
    (f.type === 'teacher' && f.studentId === 'std-1') ||
    (f.type === 'anonymous' && f.studentId === 'std-1')
  );

  const categories = ['General', 'Praise', 'Suggestion', 'Concern', 'Question'];

  const handleSubmitAnonymous = () => {
    if (!feedbackContent.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      type: 'anonymous',
      content: feedbackContent,
      schoolCode: profile?.school_code || '',
      category: feedbackCategory,
      isRead: false,
      createdAt: new Date(),
    };

    setFeedback(prev => [...prev, newFeedback]);
    setFeedbackContent('');
    setFeedbackCategory('General');
    toast.success('Feedback submitted anonymously!');
  };

  const handleSubmitTeacherFeedback = () => {
    if (!selectedStudent || !teacherFeedback.trim()) {
      toast.error('Please select a student and enter feedback');
      return;
    }

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      type: 'teacher',
      content: teacherFeedback,
      studentId: selectedStudent,
      teacherId: profile?.user_id,
      schoolCode: profile?.school_code || '',
      isRead: false,
      createdAt: new Date(),
    };

    setFeedback(prev => [...prev, newFeedback]);
    setTeacherFeedback('');
    setSelectedStudent('');
    toast.success('Feedback sent to student!');
  };

  const markAsRead = (feedbackId: string) => {
    setFeedback(prev => 
      prev.map(f => f.id === feedbackId ? { ...f, isRead: true } : f)
    );
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Praise': return <ThumbsUp className="w-4 h-4" />;
      case 'Suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'Concern': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Praise': return 'bg-success/10 text-success';
      case 'Suggestion': return 'bg-warning/10 text-warning';
      case 'Concern': return 'bg-destructive/10 text-destructive';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTeacher ? 'View student feedback and send personalized responses' : 'Submit anonymous feedback or view teacher comments'}
          </p>
        </div>

        {isTeacher ? (
          // Teacher View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Anonymous Feedback */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <EyeOff className="w-5 h-5" />
                      Anonymous Feedback
                    </CardTitle>
                    <Badge variant="secondary">
                      {anonymousFeedback.filter(f => !f.isRead).length} unread
                    </Badge>
                  </div>
                  <CardDescription>
                    Student feedback submitted anonymously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anonymousFeedback.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No anonymous feedback yet
                      </p>
                    ) : (
                      anonymousFeedback.map((fb, index) => (
                        <div 
                          key={fb.id}
                          className={`p-4 rounded-lg border animate-slide-up ${
                            fb.isRead ? 'bg-muted/30' : 'bg-card border-primary/20'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => !fb.isRead && markAsRead(fb.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getCategoryColor(fb.category)}>
                                  {getCategoryIcon(fb.category)}
                                  <span className="ml-1">{fb.category}</span>
                                </Badge>
                                {!fb.isRead && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed">{fb.content}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-muted-foreground">
                                {new Date(fb.createdAt).toLocaleDateString()}
                              </p>
                              {fb.isRead ? (
                                <CheckCircle2 className="w-4 h-4 text-success mt-1 ml-auto" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Send Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Feedback
                </CardTitle>
                <CardDescription>
                  Send personalized feedback to a student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.className})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Your Feedback</Label>
                  <Textarea
                    placeholder="Write constructive feedback for the student..."
                    rows={5}
                    className="mt-1.5"
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  variant="gradient"
                  onClick={handleSubmitTeacherFeedback}
                  disabled={!selectedStudent || !teacherFeedback.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Student View
          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList>
              <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
              <TabsTrigger value="received">From Teachers</TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5" />
                    Anonymous Feedback
                  </CardTitle>
                  <CardDescription>
                    Your feedback is completely anonymous. Teachers will only see the content and category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Your Feedback</Label>
                    <Textarea
                      placeholder="Share your thoughts, suggestions, or concerns..."
                      rows={5}
                      className="mt-1.5"
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      🔒 Your identity will not be revealed to anyone
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="gradient"
                    onClick={handleSubmitAnonymous}
                    disabled={!feedbackContent.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Anonymously
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="received">
              <div className="space-y-4">
                {teacherFeedbackList.filter(f => f.studentId === 'std-1').length === 0 ? (
                  <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No feedback yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Teacher feedback will appear here
                    </p>
                  </Card>
                ) : (
                  teacherFeedbackList
                    .filter(f => f.studentId === 'std-1')
                    .map((fb, index) => (
                      <Card 
                        key={fb.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Teacher Feedback</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(fb.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">{fb.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
