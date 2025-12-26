import { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeacherProfile } from '@/hooks/useSchoolAdminData';
import { InviteTeacherDialog } from './InviteTeacherDialog';
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  UserMinus, 
  Edit, 
  UserPlus,
  Users,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeacherManagementProps {
  teachers: TeacherProfile[];
  isLoading: boolean;
  schoolName: string;
  onDeactivate: (params: { userId: string }) => void;
  onRefresh: () => void;
}

const TeacherRow = memo(function TeacherRow({ 
  teacher, 
  onDeactivate 
}: { 
  teacher: TeacherProfile; 
  onDeactivate: (userId: string) => void;
}) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const initials = teacher.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <TableRow key={teacher.id} className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={teacher.avatar_url || undefined} alt={teacher.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{teacher.name}</p>
              <p className="text-sm text-muted-foreground">{teacher.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Teacher
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDistanceToNow(new Date(teacher.created_at), { addSuffix: true })}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove as Teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Teacher Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {teacher.name}'s teacher role? 
              They will be changed to a student account and will lose access to teacher features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDeactivate(teacher.user_id);
                setShowDeactivateDialog(false);
              }}
            >
              Remove Teacher Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export function TeacherManagement({ 
  teachers, 
  isLoading, 
  schoolName,
  onDeactivate,
  onRefresh,
}: TeacherManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.email.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Teacher Management
            </CardTitle>
            <CardDescription>
              Manage teachers in your school ({teachers.length} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <InviteTeacherDialog schoolName={schoolName}>
              <Button variant="gradient">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Teacher
              </Button>
            </InviteTeacherDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Teachers Table */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">
              {searchQuery ? 'No teachers found' : 'No teachers yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search query' 
                : 'Invite teachers to join your school'}
            </p>
            {!searchQuery && (
              <InviteTeacherDialog schoolName={schoolName}>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First Teacher
                </Button>
              </InviteTeacherDialog>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TeacherRow 
                    key={teacher.id} 
                    teacher={teacher} 
                    onDeactivate={(userId) => onDeactivate({ userId })}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
