import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Search, Loader2, UserCog, Crown, GraduationCap, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  app_role?: 'admin' | 'teacher' | 'student';
}

interface RoleManagementDialogProps {
  children: React.ReactNode;
}

const roleIcons = {
  admin: Crown,
  teacher: GraduationCap,
  student: User,
};

const roleBadgeColors = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  teacher: 'bg-accent/10 text-accent border-accent/20',
  student: 'bg-muted text-muted-foreground border-border',
};

export function RoleManagementDialog({ children }: RoleManagementDialogProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!profile?.school_code) return;
    
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, name, email, role')
        .eq('school_code', profile.school_code)
        .order('name');

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('school_code', profile.school_code);

      if (rolesError) throw rolesError;

      // Merge data
      const rolesMap = new Map(userRoles?.map(r => [r.user_id, r.role]));
      const usersWithRoles = profiles?.map(p => ({
        ...p,
        app_role: rolesMap.get(p.user_id) || 'student',
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, profile?.school_code]);

  const handleRoleChange = async (userId: string, userAuthId: string, newRole: 'admin' | 'teacher' | 'student') => {
    setUpdatingUserId(userId);
    try {
      // Update user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userAuthId)
        .eq('school_code', profile?.school_code);

      if (roleError) throw roleError;

      // If promoting to admin, update user_permissions
      if (newRole === 'admin') {
        const { data: existingPermission } = await supabase
          .from('user_permissions')
          .select('id')
          .eq('user_id', userAuthId)
          .eq('school_code', profile?.school_code)
          .single();

        if (existingPermission) {
          await supabase
            .from('user_permissions')
            .update({ admin_role: 'school_admin', is_active: true })
            .eq('id', existingPermission.id);
        } else {
          await supabase
            .from('user_permissions')
            .insert({
              user_id: userAuthId,
              school_code: profile?.school_code,
              admin_role: 'school_admin',
              is_active: true,
            });
        }
      } else {
        // Remove admin permissions if demoting
        await supabase
          .from('user_permissions')
          .update({ admin_role: 'teacher', is_active: true })
          .eq('user_id', userAuthId)
          .eq('school_code', profile?.school_code);
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, app_role: newRole } : u
      ));

      toast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Manage User Roles
          </DialogTitle>
          <DialogDescription>
            Change user roles within your school. Admins have full access to all features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.app_role || 'student'];
                  const isCurrentUser = user.user_id === profile?.user_id;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleBadgeColors[user.app_role || 'student']}`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {user.name}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {updatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrentUser ? (
                          <Badge variant="outline" className={roleBadgeColors[user.app_role || 'student']}>
                            {user.app_role || 'student'}
                          </Badge>
                        ) : (
                          <Select
                            value={user.app_role || 'student'}
                            onValueChange={(value: 'admin' | 'teacher' | 'student') => 
                              handleRoleChange(user.id, user.user_id, value)
                            }
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <span className="flex items-center gap-2">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </span>
                              </SelectItem>
                              <SelectItem value="teacher">
                                <span className="flex items-center gap-2">
                                  <GraduationCap className="w-3 h-3" />
                                  Teacher
                                </span>
                              </SelectItem>
                              <SelectItem value="student">
                                <span className="flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  Student
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
