import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, TrendingDown, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface RiskStudent {
  id: string;
  name: string;
  class_name: string;
  risk_level: string;
  risk_score: number;
  factors: string[];
}

export function RiskAlertPanel() {
  const { profile } = useAuth();
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.school_code) {
      fetchRiskData();
    }
  }, [profile?.school_code]);

  const fetchRiskData = async () => {
    try {
      const { data, error } = await supabase
        .from('student_risk_scores')
        .select(`
          id,
          risk_level,
          risk_score,
          factors,
          student:students(id, name, class_name)
        `)
        .eq('school_code', profile?.school_code)
        .in('risk_level', ['medium', 'high'])
        .order('risk_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formatted = data?.map((item: any) => ({
        id: item.student?.id,
        name: item.student?.name,
        class_name: item.student?.class_name,
        risk_level: item.risk_level,
        risk_score: item.risk_score,
        factors: item.factors || []
      })).filter((s: any) => s.id) || [];

      setRiskStudents(formatted);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskIcon = (factor: string) => {
    if (factor.toLowerCase().includes('attendance')) return <Clock className="h-3 w-3" />;
    if (factor.toLowerCase().includes('exam') || factor.toLowerCase().includes('score')) return <TrendingDown className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            At-Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            At-Risk Students
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchRiskData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {riskStudents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No at-risk students detected</p>
            <p className="text-xs">Run AI analysis to detect students needing attention</p>
          </div>
        ) : (
          <div className="space-y-3">
            {riskStudents.map((student) => (
              <div 
                key={student.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {student.class_name}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.factors.slice(0, 2).map((factor, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          {getRiskIcon(factor)}
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(student.risk_level)}>
                      {student.risk_level}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
