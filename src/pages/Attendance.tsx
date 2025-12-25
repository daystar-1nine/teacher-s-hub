import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Download,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function Attendance() {
  const { profile } = useAuth();
  const { studentsQuery, getAttendanceQuery, saveAttendanceMutation, getClassOptions, classesQuery } = useRoleBasedData();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});

  const isTeacher = profile?.role === 'teacher';
  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];
  
  // Set default class when classes load
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  const attendanceQuery = getAttendanceQuery(selectedDate, selectedClass);
  const attendanceRecords = attendanceQuery.data || [];

  const classStudents = useMemo(() => 
    students.filter(s => s.class_name === selectedClass),
    [students, selectedClass]
  );

  // Initialize local attendance from saved data
  useEffect(() => {
    const initial: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    attendanceRecords.forEach(a => {
      initial[a.student_id] = a.status as 'present' | 'absent' | 'late' | 'excused';
    });
    setLocalAttendance(initial);
  }, [attendanceRecords]);

  const stats = useMemo(() => {
    const present = Object.values(localAttendance).filter(s => s === 'present').length;
    const absent = Object.values(localAttendance).filter(s => s === 'absent').length;
    const late = Object.values(localAttendance).filter(s => s === 'late').length;
    const total = classStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, rate };
  }, [localAttendance, classStudents]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setLocalAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const records = Object.entries(localAttendance).map(([studentId, status]) => ({
      studentId,
      date: selectedDate,
      status,
      className: selectedClass,
    }));

    try {
      await saveAttendanceMutation.mutateAsync(records);
      toast.success('Attendance saved successfully!');
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const handleExport = () => {
    const data = classStudents.map(student => ({
      'Roll No': student.roll_number,
      'Name': student.name,
      'Status': localAttendance[student.id] || 'Not Marked',
      'Date': selectedDate,
      'Class': selectedClass,
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${selectedDate}.csv`;
    a.click();
    
    toast.success('Attendance exported successfully!');
  };

  const statusConfig = {
    present: { icon: CheckCircle2, color: 'bg-success/10 text-success border-success/20', label: 'Present' },
    absent: { icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Absent' },
    late: { icon: Clock, color: 'bg-warning/10 text-warning border-warning/20', label: 'Late' },
    excused: { icon: AlertCircle, color: 'bg-muted text-muted-foreground border-muted', label: 'Excused' },
  };

  if (studentsQuery.isLoading || classesQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
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
              <CalendarCheck className="w-8 h-8 text-primary" />
              Attendance
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Mark and manage daily attendance' : 'View your attendance records'}
            </p>
          </div>
          {isTeacher && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={classStudents.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleSaveAttendance}
                disabled={saveAttendanceMutation.isPending || Object.keys(localAttendance).length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveAttendanceMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="date" className="text-sm text-muted-foreground mb-2 block">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {isTeacher && (
                <div className="flex-1">
                  <Label htmlFor="class" className="text-sm text-muted-foreground mb-2 block">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rate}%</p>
                <p className="text-sm text-muted-foreground">Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Students - {selectedClass || 'Select a class'}</CardTitle>
          </CardHeader>
          <CardContent>
            {classStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {selectedClass ? 'No students in this class' : 'Select a class to view students'}
              </p>
            ) : (
              <div className="space-y-3">
                {classStudents.map((student, index) => {
                  const status = localAttendance[student.id];
                  const config = status ? statusConfig[status] : null;
                  
                  return (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Roll #{student.roll_number}</p>
                        </div>
                      </div>
                      
                      {isTeacher ? (
                        <div className="flex gap-2">
                          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((s) => {
                            const Icon = statusConfig[s].icon;
                            const isSelected = status === s;
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(student.id, s)}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  isSelected 
                                    ? statusConfig[s].color + ' border-current'
                                    : 'border-transparent hover:bg-muted'
                                }`}
                                title={statusConfig[s].label}
                              >
                                <Icon className="w-5 h-5" />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <Badge variant={status === 'present' ? 'default' : status === 'absent' ? 'destructive' : 'secondary'}>
                          {config?.label || 'Not Marked'}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
