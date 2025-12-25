import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ClipboardList,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Sparkles,
  User,
} from 'lucide-react';

export default function Exams() {
  const { profile } = useAuth();
  const { examResultsQuery, studentsQuery, createExamResultMutation, classesQuery, subjectOptions } = useRoleBasedData();
  
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Form state
  const [formStudent, setFormStudent] = useState('');
  const [formExamName, setFormExamName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMarks, setFormMarks] = useState('');
  const [formTotalMarks, setFormTotalMarks] = useState('100');
  const [formExamDate, setFormExamDate] = useState(new Date().toISOString().split('T')[0]);

  const isTeacher = profile?.role === 'teacher';
  const examResults = examResultsQuery.data || [];
  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];

  const filteredResults = useMemo(() => {
    let results = examResults;
    
    if (selectedClass !== 'all') {
      results = results.filter(r => r.class_name === selectedClass);
    }
    if (selectedSubject !== 'all') {
      results = results.filter(r => r.subject === selectedSubject);
    }
    
    return results;
  }, [examResults, selectedClass, selectedSubject]);

  const handleAddResult = async () => {
    if (!formStudent || !formExamName || !formSubject || !formMarks || !formTotalMarks) {
      toast.error('Please fill in all fields');
      return;
    }

    const student = students.find(s => s.id === formStudent);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    try {
      await createExamResultMutation.mutateAsync({
        studentId: formStudent,
        examName: formExamName,
        subject: formSubject,
        marksObtained: parseInt(formMarks),
        totalMarks: parseInt(formTotalMarks),
        className: student.class_name,
        examDate: formExamDate,
      });
      
      setFormStudent('');
      setFormExamName('');
      setFormSubject('');
      setFormMarks('');
      setFormTotalMarks('100');
      setIsAddDialogOpen(false);
      
      toast.success('Exam result added successfully!');
    } catch (error) {
      toast.error('Failed to add exam result');
    }
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp className="w-4 h-4 text-success" />;
    if (percentage >= 50) return <Minus className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-destructive" />;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success/10 text-success';
    if (percentage >= 60) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  // Student performance analysis
  const studentPerformance = useMemo(() => {
    if (isTeacher || examResults.length === 0) return null;

    const subjectAverages: Record<string, number[]> = {};
    examResults.forEach(exam => {
      if (!subjectAverages[exam.subject]) {
        subjectAverages[exam.subject] = [];
      }
      subjectAverages[exam.subject].push(exam.percentage);
    });

    const subjectStats = Object.entries(subjectAverages).map(([subject, scores]) => ({
      subject,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })).sort((a, b) => b.average - a.average);

    const overallAverage = Math.round(
      examResults.reduce((sum, e) => sum + e.percentage, 0) / examResults.length
    );

    return {
      overallAverage,
      strongSubjects: subjectStats.filter(s => s.average >= 70).slice(0, 3),
      weakSubjects: subjectStats.filter(s => s.average < 70).slice(-3),
      subjectStats,
    };
  }, [examResults, isTeacher]);

  if (examResultsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
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
              <ClipboardList className="w-8 h-8 text-primary" />
              Exam Results
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Manage and analyze student performance' : 'View your exam results and analysis'}
            </p>
          </div>
          {isTeacher && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Result
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exam Result</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Student</Label>
                    <Select value={formStudent} onValueChange={setFormStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.class_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Exam Name</Label>
                    <Input
                      placeholder="e.g., Mid-Term, Final"
                      value={formExamName}
                      onChange={(e) => setFormExamName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
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
                    <Label>Exam Date</Label>
                    <Input
                      type="date"
                      value={formExamDate}
                      onChange={(e) => setFormExamDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Marks Obtained</Label>
                      <Input
                        type="number"
                        placeholder="85"
                        value={formMarks}
                        onChange={(e) => setFormMarks(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Total Marks</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={formTotalMarks}
                        onChange={(e) => setFormTotalMarks(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    onClick={handleAddResult}
                    disabled={createExamResultMutation.isPending}
                  >
                    {createExamResultMutation.isPending ? 'Adding...' : 'Add Result'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Student Performance Overview (for students) */}
        {!isTeacher && studentPerformance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Average</p>
                    <p className="text-4xl font-bold mt-1">{studentPerformance.overallAverage}%</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="font-medium">Strong Subjects</span>
                </div>
                <div className="space-y-2">
                  {studentPerformance.strongSubjects.length > 0 ? (
                    studentPerformance.strongSubjects.map(s => (
                      <div key={s.subject} className="flex items-center justify-between">
                        <span className="text-sm">{s.subject}</span>
                        <Badge className="bg-success/10 text-success">{s.average}%</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-warning" />
                  <span className="font-medium">Needs Improvement</span>
                </div>
                <div className="space-y-2">
                  {studentPerformance.weakSubjects.length > 0 ? (
                    studentPerformance.weakSubjects.map(s => (
                      <div key={s.subject} className="flex items-center justify-between">
                        <span className="text-sm">{s.subject}</span>
                        <Badge variant="secondary">{s.average}%</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Great job! Keep it up!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {isTeacher && (
                <div className="flex-1">
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
                </div>
              )}
              <div className="flex-1">
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

        {/* Results */}
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">
              <ClipboardList className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            {isTeacher && (
              <TabsTrigger value="students">
                <User className="w-4 h-4 mr-2" />
                By Student
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No exam results found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isTeacher ? 'Click "Add Result" to add exam results' : 'No exam results have been recorded yet'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result, index) => (
                  <Card 
                    key={result.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {result.students?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{result.students?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{result.class_name}</p>
                          </div>
                        </div>
                        {getPerformanceIcon(result.percentage)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{result.subject}</Badge>
                          <span className="text-sm text-muted-foreground">{result.exam_name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold">{result.marks_obtained}<span className="text-lg text-muted-foreground">/{result.total_marks}</span></span>
                          <div className={`px-3 py-1.5 rounded-lg font-semibold ${getPerformanceColor(result.percentage)}`}>
                            {result.grade} ({result.percentage}%)
                          </div>
                        </div>

                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              result.percentage >= 80 ? 'bg-success' :
                              result.percentage >= 60 ? 'bg-warning' :
                              'bg-destructive'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {isTeacher && (
            <TabsContent value="students" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {students.map(student => {
                        const results = examResults.filter(r => r.student_id === student.id);
                        const avg = results.length > 0
                          ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                          : 0;
                        
                        return (
                          <button
                            key={student.id}
                            onClick={() => setSelectedStudent(student.id)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-muted transition-colors ${
                              selectedStudent === student.id ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">{student.name.charAt(0)}</span>
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.class_name}</p>
                              </div>
                            </div>
                            <Badge variant={avg >= 70 ? 'default' : 'secondary'}>{avg}%</Badge>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {selectedStudent 
                        ? `Results - ${students.find(s => s.id === selectedStudent)?.name}`
                        : 'Select a student'
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent ? (
                      <div className="space-y-3">
                        {examResults
                          .filter(r => r.student_id === selectedStudent)
                          .map(result => (
                            <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{result.subject}</p>
                                <p className="text-sm text-muted-foreground">{result.exam_name}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">{result.marks_obtained}/{result.total_marks}</span>
                                <Badge className={getPerformanceColor(result.percentage)}>
                                  {result.grade}
                                </Badge>
                              </div>
                            </div>
                          ))
                        }
                        {examResults.filter(r => r.student_id === selectedStudent).length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No results for this student</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Select a student from the list to view their results
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
