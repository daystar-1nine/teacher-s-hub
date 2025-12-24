import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Activity, 
  User, 
  Edit2, 
  Plus, 
  Trash2, 
  LogIn,
  Search,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: any;
  new_value: any;
  metadata: any;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  attendance_marked: <Edit2 className="h-4 w-4" />,
  marks_updated: <Edit2 className="h-4 w-4" />,
  homework_assigned: <Plus className="h-4 w-4" />,
  student_added: <Plus className="h-4 w-4" />,
  student_deleted: <Trash2 className="h-4 w-4" />,
  login: <LogIn className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />
};

const actionColors: Record<string, string> = {
  attendance_marked: 'bg-primary/10 text-primary',
  marks_updated: 'bg-warning/10 text-warning',
  homework_assigned: 'bg-success/10 text-success',
  student_added: 'bg-success/10 text-success',
  student_deleted: 'bg-destructive/10 text-destructive',
  login: 'bg-muted text-muted-foreground',
  default: 'bg-muted text-muted-foreground'
};

export default function ActivityLogs() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile?.school_code) {
      fetchLogs();
    }
  }, [profile?.school_code]);

  const fetchLogs = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*')
          .eq('school_code', profile?.school_code)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('profiles')
          .select('user_id, name')
          .eq('school_code', profile?.school_code)
      ]);

      if (logsRes.error) throw logsRes.error;
      
      const userMap: Record<string, string> = {};
      usersRes.data?.forEach(u => { userMap[u.user_id] = u.name; });
      
      setLogs(logsRes.data || []);
      setUsers(userMap);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.entity_type === filter;
    const matchesSearch = search === '' || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      users[log.user_id]?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">Track all actions and changes in your school</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by action or user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
              <SelectItem value="homework">Homework</SelectItem>
              <SelectItem value="student">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
              <Badge variant="secondary" className="ml-2">{filteredLogs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="relative pl-10">
                        <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${actionColors[log.action] || actionColors.default}`}>
                          {actionIcons[log.action] || actionIcons.default}
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatAction(log.action)}</span>
                                <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{users[log.user_id] || 'Unknown User'}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {(log.old_value || log.new_value) && (
                            <div className="mt-2 text-xs">
                              {log.old_value && (
                                <div className="text-destructive/70">
                                  - {JSON.stringify(log.old_value).slice(0, 100)}
                                </div>
                              )}
                              {log.new_value && (
                                <div className="text-success/70">
                                  + {JSON.stringify(log.new_value).slice(0, 100)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
