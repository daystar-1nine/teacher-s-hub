import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PerformanceHeatmap } from '@/components/dashboard/PerformanceHeatmap';
import { AttendanceStreaks } from '@/components/dashboard/AttendanceStreaks';
import { RiskAlertPanel } from '@/components/dashboard/RiskAlertPanel';
import { BarChart3, TrendingUp, Users, RefreshCw } from 'lucide-react';

export default function Analytics() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.school_code) {
      loadAnalytics();
    }
  }, [profile?.school_code]);

  const loadAnalytics = async () => {
    setLoading(true);
    // Mock data for demo - replace with real queries
    setHeatmapData([
      { subject: 'Mathematics', months: [{ month: 'Sep', value: 78 }, { month: 'Oct', value: 82 }, { month: 'Nov', value: 75 }, { month: 'Dec', value: 88 }] },
      { subject: 'Science', months: [{ month: 'Sep', value: 65 }, { month: 'Oct', value: 70 }, { month: 'Nov', value: 68 }, { month: 'Dec', value: 72 }] },
      { subject: 'English', months: [{ month: 'Sep', value: 85 }, { month: 'Oct', value: 88 }, { month: 'Nov', value: 90 }, { month: 'Dec', value: 92 }] },
      { subject: 'History', months: [{ month: 'Sep', value: 55 }, { month: 'Oct', value: 60 }, { month: 'Nov', value: 58 }, { month: 'Dec', value: 65 }] },
    ]);
    setStreakData([
      { studentId: '1', studentName: 'Rahul Sharma', className: '10-A', currentStreak: 45, longestStreak: 45, trend: 'up', attendanceRate: 98 },
      { studentId: '2', studentName: 'Priya Patel', className: '10-B', currentStreak: 38, longestStreak: 40, trend: 'stable', attendanceRate: 95 },
      { studentId: '3', studentName: 'Amit Kumar', className: '10-A', currentStreak: 12, longestStreak: 30, trend: 'down', attendanceRate: 72 },
    ]);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Performance insights and trends</p>
          </div>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceHeatmap data={heatmapData} title="Subject Performance by Month" />
          </div>
          <RiskAlertPanel />
        </div>

        <AttendanceStreaks streaks={streakData} />
      </div>
    </DashboardLayout>
  );
}
