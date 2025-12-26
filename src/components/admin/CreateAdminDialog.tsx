import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Loader2, Eye, EyeOff, UserPlus, AlertTriangle } from 'lucide-react';

// Strong password validation schema
const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  school_code: z.string().optional(),
  is_super_admin: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

interface CreateAdminDialogProps {
  children: React.ReactNode;
  isSuperAdmin?: boolean;
}

export function CreateAdminDialog({ children, isSuperAdmin = false }: CreateAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch available schools for super admins
  const { data: schools } = useQuery({
    queryKey: ['schools-for-admin-creation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('code, name')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin && open,
  });

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      school_code: '',
      is_super_admin: false,
    },
  });

  const onSubmit = async (data: CreateAdminForm) => {
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to create an admin');
        return;
      }

      const response = await supabase.functions.invoke('create-admin', {
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          school_code: data.school_code || null,
          is_super_admin: data.is_super_admin,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create admin');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('Admin created successfully!', {
        description: `${data.name} can now login with their credentials.`,
      });
      
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      toast.error('Failed to create admin', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Create New Admin
          </DialogTitle>
          <DialogDescription>
            Create a new administrator account. They will be able to login immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Security Notice</p>
            <p className="text-muted-foreground">
              Only create admin accounts for trusted staff members. All admin actions are logged.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@school.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must contain uppercase, lowercase, number, and special character
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School Selection (Super Admins only) */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="school_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to School</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">All Schools (Super Admin)</SelectItem>
                        {schools?.map((school) => (
                          <SelectItem key={school.code} value={school.code}>
                            {school.name} ({school.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty to create an admin with access to all schools
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Super Admin checkbox (Super Admins only) */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="is_super_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Grant Super Admin Privileges
                      </FormLabel>
                      <FormDescription>
                        Super admins can manage all schools and create other admins
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
