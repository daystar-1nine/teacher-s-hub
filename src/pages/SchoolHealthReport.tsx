import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  BookOpen,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function SchoolHealthReport() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (profile?.school_code) {
      fetchLatestReport();
    }
  }, [profile?.school_code]);

  const fetchLatestReport = async () => {
    try {
      const { data, error } = await supabase
        .from('school_health_reports')
        .select('*')
        .eq('school_code', profile?.school_code)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Gather school data
      const [studentsRes, attendanceRes, examsRes] = await Promise.all([
        supabase.from('students').select('id').eq('school_code', profile?.school_code),
        supabase.from('attendance_records').select('status').eq('school_code', profile?.school_code),
        supabase.from('exam_results').select('percentage, subject').eq('school_code', profile?.school_code)
      ]);

      const presentCount = attendanceRes.data?.filter(a => a.status === 'present').length || 0;
      const totalAttendance = attendanceRes.data?.length || 1;
      
      const subjectAverages: Record<string, number[]> = {};
      examsRes.data?.forEach(e => {
        if (!subjectAverages[e.subject]) subjectAverages[e.subject] = [];
        subjectAverages[e.subject].push(e.percentage);
      });

      const schoolData = {
        name: 'School',
        totalStudents: studentsRes.data?.length || 0,
        totalTeachers: 10,
        classes: ['10-A', '10-B', '9-A', '9-B'],
        attendance: {
          overallRate: Math.round((presentCount / totalAttendance) * 100),
          totalPresent: presentCount,
          totalAbsent: totalAttendance - presentCount
        },
        exams: {
          bySubject: Object.entries(subjectAverages).map(([subject, scores]) => ({
            subject,
            average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }))
        },
        homework: { total: 50, completionRate: 78, onTimeRate: 65 },
        atRiskCount: 3
      };

      const { data, error } = await supabase.functions.invoke('generate-school-report', {
        body: { schoolData, reportMonth: format(new Date(), 'MMMM yyyy') }
      });

      if (error) throw error;

      // Save report
      const { error: saveError } = await supabase.from('school_health_reports').insert({
        school_code: profile?.school_code,
        generated_by: profile?.user_id,
        report_month: new Date().toISOString().slice(0, 10),
        report_content: data,
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        metrics: { health_score: data.overall_health_score }
      });

      if (saveError) throw saveError;
      
      setReport({
        report_content: data,
        created_at: new Date().toISOString(),
        metrics: { health_score: data.overall_health_score }
      });
      
      toast.success('Report generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
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

  const content = report?.report_content;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI School Health Report
            </h1>
            <p className="text-muted-foreground">AI-generated insights about your school's performance</p>
          </div>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" />Generate New Report</>
            )}
          </Button>
        </div>

        {!report ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Report Generated Yet</h3>
              <p className="text-muted-foreground mb-4">Generate an AI-powered health report to see insights</p>
              <Button onClick={generateReport} disabled={generating}>
                {generating ? 'Generating...' : 'Generate First Report'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Health Score */}
            <Card className="gradient-primary text-white">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80">Overall Health Score</p>
                    <p className="text-5xl font-bold">{report.metrics?.health_score || content?.overall_health_score || 0}%</p>
                    <p className="text-sm text-white/70 mt-1">
                      Generated {format(new Date(report.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    {(report.metrics?.health_score || 0) >= 70 ? (
                      <CheckCircle className="h-16 w-16 text-white/80" />
                    ) : (
                      <AlertTriangle className="h-16 w-16 text-white/80" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {content?.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{content.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {content?.attendance_analysis && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{content.attendance_analysis}</p>
                  </CardContent>
                </Card>
              )}
              {content?.academic_performance && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-success" />
                      Academics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{content.academic_performance}</p>
                  </CardContent>
                </Card>
              )}
              {content?.engagement && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-warning" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{content.engagement}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Insights & Recommendations */}
            <div className="grid gap-6 md:grid-cols-2">
              {content?.insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(Array.isArray(content.insights) ? content.insights : []).map((insight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {content?.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(Array.isArray(content.recommendations) ? content.recommendations : []).map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
