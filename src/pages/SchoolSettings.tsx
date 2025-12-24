import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Settings, 
  School, 
  Palette, 
  Calendar, 
  Bell, 
  Shield,
  Save,
  Loader2
} from 'lucide-react';

export default function SchoolSettings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#F97316',
    academic_year_start: '',
    academic_year_end: '',
    timezone: 'Asia/Kolkata',
    attendance_threshold: 75,
    features_enabled: {
      ai_features: true,
      feedback_system: true,
      homework_submissions: true
    }
  });

  useEffect(() => {
    if (profile?.school_code) {
      fetchSettings();
    }
  }, [profile?.school_code]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_code', profile?.school_code)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('school_settings')
        .upsert({
          school_code: profile?.school_code,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'school_code' });

      if (error) throw error;
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-3xl font-bold">School Settings</h1>
            <p className="text-muted-foreground">Configure your school profile and preferences</p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding"><Palette className="mr-2 h-4 w-4" />Branding</TabsTrigger>
            <TabsTrigger value="academic"><Calendar className="mr-2 h-4 w-4" />Academic</TabsTrigger>
            <TabsTrigger value="features"><Settings className="mr-2 h-4 w-4" />Features</TabsTrigger>
            <TabsTrigger value="rules"><Shield className="mr-2 h-4 w-4" />Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>School Branding</CardTitle>
                <CardDescription>Customize your school's appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>School Logo URL</Label>
                    <Input 
                      placeholder="https://example.com/logo.png"
                      value={settings.logo_url || ''}
                      onChange={e => setSettings({...settings, logo_url: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" className="h-16 w-16 object-contain rounded-lg border" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                        <School className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={settings.primary_color}
                        onChange={e => setSettings({...settings, primary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        value={settings.primary_color}
                        onChange={e => setSettings({...settings, primary_color: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={settings.secondary_color}
                        onChange={e => setSettings({...settings, secondary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        value={settings.secondary_color}
                        onChange={e => setSettings({...settings, secondary_color: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Year Settings</CardTitle>
                <CardDescription>Configure your academic calendar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Academic Year Start</Label>
                    <Input 
                      type="date"
                      value={settings.academic_year_start || ''}
                      onChange={e => setSettings({...settings, academic_year_start: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year End</Label>
                    <Input 
                      type="date"
                      value={settings.academic_year_end || ''}
                      onChange={e => setSettings({...settings, academic_year_end: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input 
                    value={settings.timezone}
                    onChange={e => setSettings({...settings, timezone: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">AI Features</p>
                    <p className="text-sm text-muted-foreground">Enable AI-powered explanations, risk detection, and reports</p>
                  </div>
                  <Switch 
                    checked={settings.features_enabled?.ai_features}
                    onCheckedChange={v => setSettings({
                      ...settings, 
                      features_enabled: {...settings.features_enabled, ai_features: v}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Feedback System</p>
                    <p className="text-sm text-muted-foreground">Allow students and teachers to exchange feedback</p>
                  </div>
                  <Switch 
                    checked={settings.features_enabled?.feedback_system}
                    onCheckedChange={v => setSettings({
                      ...settings, 
                      features_enabled: {...settings.features_enabled, feedback_system: v}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Homework Submissions</p>
                    <p className="text-sm text-muted-foreground">Allow students to submit homework online</p>
                  </div>
                  <Switch 
                    checked={settings.features_enabled?.homework_submissions}
                    onCheckedChange={v => setSettings({
                      ...settings, 
                      features_enabled: {...settings.features_enabled, homework_submissions: v}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Attendance & Grading Rules</CardTitle>
                <CardDescription>Set thresholds and grading criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Minimum Attendance Threshold (%)</Label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={settings.attendance_threshold}
                    onChange={e => setSettings({...settings, attendance_threshold: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">Students below this threshold will be flagged</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
