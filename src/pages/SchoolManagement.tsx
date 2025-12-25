import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  School, 
  Plus,
  Copy,
  Check,
  Loader2,
  Users,
  GraduationCap,
  Search,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

interface SchoolData {
  id: string;
  code: string;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  user_count?: number;
  student_count?: number;
}

export default function SchoolManagement() {
  const { profile, isAdmin } = useAuth();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New school form state
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Fetch all schools (admin can see all)
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get counts for each school
      const schoolsWithCounts = await Promise.all(
        (schoolsData || []).map(async (school) => {
          const [usersResult, studentsResult] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_code', school.code),
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_code', school.code)
          ]);
          
          return {
            ...school,
            user_count: usersResult.count || 0,
            student_count: studentsResult.count || 0
          };
        })
      );

      setSchools(schoolsWithCounts);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const generateSchoolCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SCH';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewSchool({ ...newSchool, code });
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSchool.name || !newSchool.code) {
      toast.error('School name and code are required');
      return;
    }

    if (newSchool.code.length < 4) {
      toast.error('School code must be at least 4 characters');
      return;
    }

    setCreating(true);
    try {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('schools')
        .select('code')
        .eq('code', newSchool.code.toUpperCase())
        .maybeSingle();

      if (existing) {
        toast.error('This school code already exists');
        setCreating(false);
        return;
      }

      const { error } = await supabase.from('schools').insert({
        name: newSchool.name,
        code: newSchool.code.toUpperCase(),
        email: newSchool.email || null,
        phone: newSchool.phone || null,
        address: newSchool.address || null
      });

      if (error) throw error;

      toast.success('School created successfully!');
      setDialogOpen(false);
      setNewSchool({ name: '', code: '', email: '', phone: '', address: '' });
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create school');
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('School code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display">School Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage school codes for your organization
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchSchools} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New School</DialogTitle>
                    <DialogDescription>
                      Add a new school and generate a unique code for teachers and students to join.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSchool} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="school-name">School Name *</Label>
                      <Input
                        id="school-name"
                        placeholder="Springfield High School"
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school-code">School Code *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="school-code"
                          placeholder="SCH12345"
                          value={newSchool.code}
                          onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value.toUpperCase() })}
                          className="uppercase font-mono"
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateSchoolCode}>
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This code will be used by teachers and students to join the school
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school-email">Email</Label>
                      <Input
                        id="school-email"
                        type="email"
                        placeholder="admin@school.edu"
                        value={newSchool.email}
                        onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school-phone">Phone</Label>
                      <Input
                        id="school-phone"
                        placeholder="+1 234 567 8900"
                        value={newSchool.phone}
                        onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school-address">Address</Label>
                      <Input
                        id="school-address"
                        placeholder="123 Education Lane, City"
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create School
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <School className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{schools.length}</p>
                  <p className="text-sm text-muted-foreground">Total Schools</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {schools.reduce((acc, s) => acc + (s.user_count || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {schools.reduce((acc, s) => acc + (s.student_count || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </ScrollReveal>

        {/* Schools Table */}
        <ScrollReveal animation="fade-up" delay={200}>
          <Card>
            <CardHeader>
              <CardTitle>Registered Schools</CardTitle>
              <CardDescription>
                Share the school code with teachers and students so they can join during signup
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredSchools.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <School className="w-12 h-12 mb-2 opacity-50" />
                  <p>No schools found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>School Code</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-center">Users</TableHead>
                        <TableHead className="text-center">Students</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.map((school) => (
                        <TableRow key={school.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <School className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{school.name}</p>
                                {school.address && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {school.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-sm">
                                {school.code}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyCode(school.code)}
                              >
                                {copiedCode === school.code ? (
                                  <Check className="w-4 h-4 text-success" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              {school.email && (
                                <p className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {school.email}
                                </p>
                              )}
                              {school.phone && (
                                <p className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {school.phone}
                                </p>
                              )}
                              {!school.email && !school.phone && (
                                <p className="text-muted-foreground">-</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{school.user_count || 0}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{school.student_count || 0}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(school.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Instructions Card */}
        <ScrollReveal animation="fade-up" delay={250}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <School className="w-5 h-5 text-primary" />
                How School Codes Work
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  Create a school and note down the generated school code
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  Share the code with teachers and students in your institution
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  During signup, users enter this code to join the correct school
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  All data is automatically scoped to the school for security
                </li>
              </ul>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
