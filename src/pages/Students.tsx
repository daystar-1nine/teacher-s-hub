import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStudents, mockExamResults, mockAttendance, mockHomeworkSubmissions } from '@/data/mockData';
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  GraduationCap,
  Filter,
} from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);

  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.includes(searchQuery) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.className === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [searchQuery, selectedClass]);

  const getStudentStats = (studentId: string) => {
    const exams = mockExamResults.filter(e => e.studentId === studentId);
    const attendance = mockAttendance.filter(a => a.studentId === studentId);
    const homework = mockHomeworkSubmissions.filter(h => h.studentId === studentId);

    const avgScore = exams.length > 0
      ? Math.round(exams.reduce((sum, e) => sum + e.percentage, 0) / exams.length)
      : 0;
    
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0
      ? Math.round((presentDays / attendance.length) * 100)
      : 100;
    
    const completedHomework = homework.filter(h => h.status !== 'pending').length;

    return { avgScore, attendanceRate, completedHomework, totalHomework: homework.length };
  };

  const classes = [...new Set(mockStudents.map(s => s.className))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view student profiles and performance
          </p>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedClass === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedClass('all')}
                >
                  All
                </Button>
                {classes.map(c => (
                  <Button
                    key={c}
                    variant={selectedClass === c ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClass(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => {
            const stats = getStudentStats(student.id);
            
            return (
              <Card 
                key={student.id}
                variant="interactive"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{student.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">Roll #{student.rollNumber}</p>
                      <Badge variant="secondary" className="mt-2">{student.className}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-semibold">{stats.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-semibold">{stats.attendanceRate}%</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-semibold">{stats.completedHomework}</p>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No students found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </Card>
        )}

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedStudent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{selectedStudent.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedStudent.name}</h2>
                      <p className="text-sm text-muted-foreground font-normal">
                        {selectedStudent.className} • Roll #{selectedStudent.rollNumber}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="exams">Exams</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="homework">Homework</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{selectedStudent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{selectedStudent.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Parent</p>
                          <p className="text-sm font-medium">{selectedStudent.parentName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Enrolled</p>
                          <p className="text-sm font-medium">
                            {selectedStudent.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.subjects.map(subject => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="exams" className="mt-4">
                    <div className="space-y-3">
                      {mockExamResults
                        .filter(e => e.studentId === selectedStudent.id)
                        .map(exam => (
                          <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium">{exam.subject}</p>
                              <p className="text-sm text-muted-foreground">{exam.examName}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{exam.marksObtained}/{exam.totalMarks}</span>
                              <Badge className={
                                exam.percentage >= 80 ? 'bg-success/10 text-success' :
                                exam.percentage >= 60 ? 'bg-warning/10 text-warning' :
                                'bg-destructive/10 text-destructive'
                              }>
                                {exam.grade}
                              </Badge>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance" className="mt-4">
                    <div className="space-y-3">
                      {mockAttendance
                        .filter(a => a.studentId === selectedStudent.id)
                        .slice(0, 10)
                        .map(att => (
                          <div key={att.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span>{new Date(att.date).toLocaleDateString()}</span>
                            <Badge variant={
                              att.status === 'present' ? 'default' :
                              att.status === 'absent' ? 'destructive' :
                              'secondary'
                            }>
                              {att.status}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>

                  <TabsContent value="homework" className="mt-4">
                    <div className="space-y-3">
                      {mockHomeworkSubmissions
                        .filter(h => h.studentId === selectedStudent.id)
                        .map(submission => (
                          <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span>Homework #{submission.homeworkId}</span>
                            <Badge variant={
                              submission.status === 'submitted' || submission.status === 'graded' ? 'default' :
                              submission.status === 'late' ? 'secondary' :
                              'destructive'
                            }>
                              {submission.status}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
