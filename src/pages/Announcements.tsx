import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Megaphone, 
  Plus, 
  Bell, 
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Trash2,
  Edit,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_type: string;
  target_classes: string[];
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string;
}

export default function Announcements() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_type: 'all',
    target_classes: [] as string[],
    expires_at: '',
  });

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', profile?.school_code],
    queryFn: async () => {
      if (!profile?.school_code) return [];
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('school_code', profile.school_code)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!profile?.school_code,
  });

  // Fetch classes for targeting
  const { data: classes } = useQuery({
    queryKey: ['classes', profile?.school_code],
    queryFn: async () => {
      if (!profile?.school_code) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_code', profile.school_code)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.school_code,
  });

  // Create/Update announcement
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (!profile?.school_code || !profile?.user_id) throw new Error('Not authenticated');
      
      const payload = {
        title: data.title,
        content: data.content,
        priority: data.priority,
        target_type: data.target_type,
        target_classes: data.target_classes,
        expires_at: data.expires_at || null,
        school_code: profile.school_code,
        created_by: profile.user_id,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      if (data.id) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: editingAnnouncement ? 'Announcement updated' : 'Announcement posted' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_type: 'all',
      target_classes: [],
      expires_at: '',
    });
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'normal',
      target_type: announcement.target_type || 'all',
      target_classes: announcement.target_classes || [],
      expires_at: announcement.expires_at ? format(new Date(announcement.expires_at), 'yyyy-MM-dd') : '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(editingAnnouncement ? { ...formData, id: editingAnnouncement.id } : formData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Bell className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Post and manage school-wide or class-specific notices
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your announcement here..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value) => setFormData({ ...formData, target_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All School</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="classes">Specific Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.target_type === 'classes' && (
                  <div className="space-y-2">
                    <Label>Select Classes</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                      {classes?.map((cls) => (
                        <label key={cls.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={formData.target_classes.includes(cls.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, target_classes: [...formData.target_classes, cls.name] });
                              } else {
                                setFormData({ ...formData, target_classes: formData.target_classes.filter(c => c !== cls.name) });
                              }
                            }}
                          />
                          {cls.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expires">Expires On (Optional)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Posting...' : editingAnnouncement ? 'Update' : 'Post Announcement'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{announcements?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {announcements?.filter(a => a.priority === 'urgent').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Urgent Notices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {announcements?.filter(a => !a.expires_at || new Date(a.expires_at) > new Date()).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Notices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>All posted announcements for your school</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
            ) : announcements?.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground/70">Create your first announcement to notify students and teachers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements?.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(announcement.priority || 'normal')}
                          <h3 className="font-semibold text-foreground truncate">{announcement.title}</h3>
                          <Badge variant={getPriorityColor(announcement.priority || 'normal') as any}>
                            {announcement.priority || 'normal'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {announcement.target_type === 'all' ? 'All School' : 
                             announcement.target_type === 'classes' ? announcement.target_classes?.join(', ') :
                             announcement.target_type}
                          </span>
                          {announcement.expires_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires: {format(new Date(announcement.expires_at), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
