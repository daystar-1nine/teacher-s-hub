import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export default function Students() {
  const { studentsQuery, examResultsQuery, getClassOptions } = useRoleBasedData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const students = studentsQuery.data || [];
  const examResults = examResultsQuery.data || [];
  const classes = [...new Set(students.map(s => s.class_name))];

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_number.includes(searchQuery) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesClass = selectedClass === 'all' || student.class_name === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClass]);

  const getStudentStats = (studentId: string) => {
    const exams = examResults.filter(e => e.student_id === studentId);
    const avgScore = exams.length > 0
      ? Math.round(exams.reduce((sum, e) => sum + e.percentage, 0) / exams.length)
      : 0;

    return { avgScore, examCount: exams.length };
  };

  if (studentsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <div className="flex gap-2 flex-wrap">
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
                className="animate-slide-up cursor-pointer"
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
                      <p className="text-sm text-muted-foreground">Roll #{student.roll_number}</p>
                      <Badge variant="secondary" className="mt-2">{student.class_name}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-semibold">{stats.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-semibold">{stats.examCount}</p>
                      <p className="text-xs text-muted-foreground">Exams</p>
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
              {students.length === 0 ? 'No students have been added yet' : 'Try adjusting your search or filters'}
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
                        {selectedStudent.class_name} • Roll #{selectedStudent.roll_number}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="exams">Exams</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{selectedStudent.email || 'N/A'}</p>
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
                          <p className="text-sm font-medium">{selectedStudent.parent_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Enrolled</p>
                          <p className="text-sm font-medium">
                            {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedStudent.subjects && selectedStudent.subjects.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.subjects.map((subject: string) => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="exams" className="mt-4">
                    <div className="space-y-3">
                      {examResults
                        .filter(e => e.student_id === selectedStudent.id)
                        .map(exam => (
                          <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium">{exam.subject}</p>
                              <p className="text-sm text-muted-foreground">{exam.exam_name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{exam.marks_obtained}/{exam.total_marks}</span>
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
                      {examResults.filter(e => e.student_id === selectedStudent.id).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No exam results yet</p>
                      )}
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
