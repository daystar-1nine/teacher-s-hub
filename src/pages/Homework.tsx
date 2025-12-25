import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfetti } from '@/hooks/useConfetti';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  Filter,
} from 'lucide-react';

export default function HomeworkPage() {
  const { profile } = useAuth();
  const confetti = useConfetti();
  const { 
    homeworkQuery, 
    studentsQuery, 
    createHomeworkMutation, 
    submitHomeworkMutation,
    classesQuery,
    subjectOptions,
    getStudentId 
  } = useRoleBasedData();

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  const isTeacher = profile?.role === 'teacher';
  const homework = homeworkQuery.data || [];
  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];

  useEffect(() => {
    const fetchStudentId = async () => {
      const id = await getStudentId();
      setStudentId(id);
    };
    if (!isTeacher) {
      fetchStudentId();
    }
  }, [isTeacher, getStudentId]);

  const filteredHomework = useMemo(() => {
    return homework.filter(hw => {
      if (selectedClass !== 'all' && hw.class_name !== selectedClass) return false;
      if (selectedSubject !== 'all' && hw.subject !== selectedSubject) return false;
      return true;
    });
  }, [homework, selectedClass, selectedSubject]);

  const handleAddHomework = async () => {
    if (!formTitle || !formDescription || !formSubject || !formClass || !formDueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createHomeworkMutation.mutateAsync({
        title: formTitle,
        description: formDescription,
        subject: formSubject,
        className: formClass,
        dueDate: formDueDate,
      });
      
      setFormTitle('');
      setFormDescription('');
      setFormSubject('');
      setFormClass('');
      setFormDueDate('');
      setIsAddDialogOpen(false);
      
      toast.success('Homework assigned successfully!');
    } catch (error) {
      toast.error('Failed to assign homework');
    }
  };

  const handleSubmit = async (homeworkId: string) => {
    if (!studentId) {
      toast.error('Student ID not found');
      return;
    }

    try {
      await submitHomeworkMutation.mutateAsync({ homeworkId, studentId });
      confetti.emoji();
      toast.success('🎉 Homework submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit homework');
    }
  };

  const getDaysLeft = (dueDate: string) => {
    return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (homeworkQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Homework
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Assign and track homework submissions' : 'View and submit your homework'}
            </p>
          </div>
          {isTeacher && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Homework
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Assign New Homework</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Chapter 5 Practice Problems"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the homework assignment..."
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={formSubject} onValueChange={setFormSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class">Class</Label>
                      <Select value={formClass} onValueChange={setFormClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    onClick={handleAddHomework}
                    disabled={createHomeworkMutation.isPending}
                  >
                    {createHomeworkMutation.isPending ? 'Assigning...' : 'Assign Homework'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homework List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHomework.map((hw, index) => {
            const daysLeft = getDaysLeft(hw.due_date);
            const isOverdue = daysLeft < 0;

            return (
              <Card 
                key={hw.id}
                variant="interactive"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={isOverdue ? 'destructive' : 'default'}>
                      {hw.subject}
                    </Badge>
                    <Badge variant="secondary">{hw.class_name}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{hw.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{hw.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Due Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                      <span className={`ml-auto font-medium ${
                        isOverdue ? 'text-destructive' :
                        daysLeft <= 2 ? 'text-warning' :
                        'text-success'
                      }`}>
                        {isOverdue ? 'Overdue' :
                         daysLeft === 0 ? 'Today' :
                         `${daysLeft} days left`}
                      </span>
                    </div>

                    {/* Student View: Status & Actions */}
                    {!isTeacher && studentId && (
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 ${
                          isOverdue ? 'text-destructive' : 'text-warning'
                        }`}>
                          {isOverdue ? (
                            <><AlertCircle className="w-4 h-4" /> Overdue</>
                          ) : (
                            <><Clock className="w-4 h-4" /> Pending</>
                          )}
                        </div>
                        {!isOverdue && (
                          <Button 
                            size="sm" 
                            onClick={() => handleSubmit(hw.id)}
                            disabled={submitHomeworkMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedHomework(hw)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredHomework.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No homework found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isTeacher ? 'Click "Assign Homework" to create a new assignment' : 'No homework has been assigned yet'}
            </p>
          </Card>
        )}

        {/* Homework Detail Dialog */}
        <Dialog open={!!selectedHomework} onOpenChange={() => setSelectedHomework(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedHomework?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Badge>{selectedHomework?.subject}</Badge>
                <Badge variant="secondary">{selectedHomework?.class_name}</Badge>
              </div>
              <p className="text-muted-foreground">{selectedHomework?.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Due: {selectedHomework?.due_date && new Date(selectedHomework.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
