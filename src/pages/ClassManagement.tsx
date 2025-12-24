import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  BookOpen,
  Loader2,
  GraduationCap
} from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  section: string | null;
  class_teacher_id: string | null;
  subjects: string[];
  room_number: string | null;
  capacity: number;
  is_active: boolean;
}

export default function ClassManagement() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [form, setForm] = useState({
    name: '',
    section: '',
    class_teacher_id: '',
    subjects: '',
    room_number: '',
    capacity: 40
  });

  useEffect(() => {
    if (profile?.school_code) {
      fetchData();
    }
  }, [profile?.school_code]);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        supabase
          .from('classes')
          .select('*')
          .eq('school_code', profile?.school_code)
          .order('name'),
        supabase
          .from('profiles')
          .select('user_id, name')
          .eq('school_code', profile?.school_code)
          .eq('role', 'teacher')
      ]);

      if (classesRes.error) throw classesRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    setForm({ name: '', section: '', class_teacher_id: '', subjects: '', room_number: '', capacity: 40 });
    setDialogOpen(true);
  };

  const openEditDialog = (cls: ClassData) => {
    setEditingClass(cls);
    setForm({
      name: cls.name,
      section: cls.section || '',
      class_teacher_id: cls.class_teacher_id || '',
      subjects: cls.subjects?.join(', ') || '',
      room_number: cls.room_number || '',
      capacity: cls.capacity
    });
    setDialogOpen(true);
  };

  const saveClass = async () => {
    if (!form.name) {
      toast.error('Class name is required');
      return;
    }

    try {
      const data = {
        school_code: profile?.school_code,
        name: form.name,
        section: form.section || null,
        class_teacher_id: form.class_teacher_id || null,
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        room_number: form.room_number || null,
        capacity: form.capacity
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(data)
          .eq('id', editingClass.id);
        if (error) throw error;
        toast.success('Class updated!');
      } else {
        const { error } = await supabase
          .from('classes')
          .insert(data);
        if (error) throw error;
        toast.success('Class created!');
      }

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save class');
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Class deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const getTeacherName = (id: string | null) => {
    if (!id) return 'Not assigned';
    const teacher = teachers.find(t => t.user_id === id);
    return teacher?.name || 'Unknown';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Class Management</h1>
            <p className="text-muted-foreground">Create and manage classes and sections</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input 
                      placeholder="e.g., 10th Grade"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input 
                      placeholder="e.g., A, B, C"
                      value={form.section}
                      onChange={e => setForm({...form, section: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Class Teacher</Label>
                  <Select value={form.class_teacher_id} onValueChange={v => setForm({...form, class_teacher_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.user_id} value={t.user_id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subjects (comma-separated)</Label>
                  <Input 
                    placeholder="Math, Science, English"
                    value={form.subjects}
                    onChange={e => setForm({...form, subjects: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Number</Label>
                    <Input 
                      placeholder="e.g., 101"
                      value={form.room_number}
                      onChange={e => setForm({...form, room_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input 
                      type="number"
                      value={form.capacity}
                      onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <Button onClick={saveClass} className="w-full">
                  {editingClass ? 'Update Class' : 'Create Class'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classes.filter(c => c.class_teacher_id).length}</p>
                  <p className="text-sm text-muted-foreground">With Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <BookOpen className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(classes.flatMap(c => c.subjects || [])).size}</p>
                  <p className="text-sm text-muted-foreground">Unique Subjects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes created yet</p>
                <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />Create First Class
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map(cls => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.section || '-'}</TableCell>
                      <TableCell>{getTeacherName(cls.class_teacher_id)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cls.subjects?.slice(0, 3).map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {(cls.subjects?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">+{(cls.subjects?.length || 0) - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{cls.capacity}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(cls)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteClass(cls.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
