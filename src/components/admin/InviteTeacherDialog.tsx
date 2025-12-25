import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

interface InviteTeacherDialogProps {
  schoolName: string;
  children: React.ReactNode;
}

export function InviteTeacherDialog({ schoolName, children }: InviteTeacherDialogProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !profile?.school_code) return;

    setIsLoading(true);
    try {
      const signupUrl = `${window.location.origin}/auth?mode=signup&role=teacher&school=${profile.school_code}`;
      
      const { data, error } = await supabase.functions.invoke('send-teacher-invitation', {
        body: {
          email,
          schoolCode: profile.school_code,
          schoolName: schoolName || 'Your School',
          inviterName: profile.name || 'Admin',
          signupUrl,
        },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Invite Teacher
          </DialogTitle>
          <DialogDescription>
            Send an email invitation with your school code to a new teacher.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Teacher's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="teacher@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              The teacher will receive an email with:
            </p>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>• School Code: <span className="font-mono font-medium text-foreground">{profile?.school_code}</span></li>
              <li>• Direct signup link</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
