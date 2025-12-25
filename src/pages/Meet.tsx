import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedData } from '@/hooks/useRoleBasedData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Video,
  Plus,
  Copy,
  Trash2,
  Link as LinkIcon,
  Users,
  Calendar,
  Play,
} from 'lucide-react';

export default function Meet() {
  const { profile } = useAuth();
  const { meetLinksQuery, createMeetLinkMutation, deleteMeetLinkMutation, classesQuery, subjectOptions } = useRoleBasedData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formClass, setFormClass] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formLink, setFormLink] = useState('');

  const isTeacher = profile?.role === 'teacher';
  const meetLinks = meetLinksQuery.data || [];
  const classes = classesQuery.data || [];

  const handleAddLink = async () => {
    if (!formClass || !formLink) {
      toast.error('Please fill in required fields');
      return;
    }

    if (!formLink.includes('meet.google.com')) {
      toast.error('Please enter a valid Google Meet link');
      return;
    }

    try {
      await createMeetLinkMutation.mutateAsync({
        className: formClass,
        subject: formSubject || undefined,
        meetLink: formLink,
      });
      
      setFormClass('');
      setFormSubject('');
      setFormLink('');
      setIsAddDialogOpen(false);
      toast.success('Meet link added successfully!');
    } catch (error) {
      toast.error('Failed to add meet link');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteMeetLinkMutation.mutateAsync(linkId);
      toast.success('Meet link deleted');
    } catch (error) {
      toast.error('Failed to delete meet link');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleJoinMeet = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (meetLinksQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
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
              <Video className="w-8 h-8 text-primary" />
              Google Meet
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Manage class meeting links' : 'Join your virtual classes with one click'}
            </p>
          </div>
          {isTeacher && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meet Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Google Meet Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Class *</Label>
                    <Select value={formClass} onValueChange={setFormClass}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject (Optional)</Label>
                    <Select value={formSubject} onValueChange={setFormSubject}>
                      <SelectTrigger className="mt-1.5">
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
                    <Label>Google Meet Link *</Label>
                    <Input
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="mt-1.5"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste your Google Meet link here
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="gradient"
                    onClick={handleAddLink}
                    disabled={!formClass || !formLink || createMeetLinkMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createMeetLinkMutation.isPending ? 'Adding...' : 'Add Link'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Info Banner for Students */}
        {!isTeacher && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">One-Click Join</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Join" button to open Google Meet in a new tab. Make sure you're signed in to your school Google account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meet Links Grid */}
        {meetLinks.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No Meet Links</h3>
            <p className="text-muted-foreground mt-2">
              {isTeacher 
                ? 'Click "Add Meet Link" to create your first virtual classroom'
                : 'No class meetings have been scheduled yet'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetLinks.map((meet, index) => (
              <Card 
                key={meet.id}
                className="animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-2 gradient-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{meet.class_name}</CardTitle>
                      <CardDescription>
                        {meet.subject || 'General Meeting'}
                      </CardDescription>
                    </div>
                    <Badge variant={meet.is_active ? 'default' : 'secondary'}>
                      {meet.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{meet.meet_link}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="gradient"
                      onClick={() => handleJoinMeet(meet.meet_link)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyLink(meet.meet_link)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {isTeacher && (
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteLink(meet.id)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMeetLinkMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(meet.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meet.class_name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Start Guide for Teachers */}
        {isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0">1</div>
                  <div>
                    <p className="font-medium">Create Meet</p>
                    <p className="text-sm text-muted-foreground">Go to meet.google.com and start a new meeting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0">2</div>
                  <div>
                    <p className="font-medium">Copy Link</p>
                    <p className="text-sm text-muted-foreground">Copy the meeting link from Google Meet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0">3</div>
                  <div>
                    <p className="font-medium">Add Here</p>
                    <p className="text-sm text-muted-foreground">Paste the link and assign to a class</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
