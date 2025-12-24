import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface AttendanceStreak {
  studentId: string;
  studentName: string;
  className: string;
  currentStreak: number;
  longestStreak: number;
  trend: 'up' | 'down' | 'stable';
  attendanceRate: number;
}

interface AttendanceStreaksProps {
  streaks: AttendanceStreak[];
}

export function AttendanceStreaks({ streaks }: AttendanceStreaksProps) {
  const sortedStreaks = [...streaks].sort((a, b) => b.currentStreak - a.currentStreak);
  const topStreaks = sortedStreaks.slice(0, 5);
  const droppingStudents = streaks.filter(s => s.trend === 'down' && s.attendanceRate < 80);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            Top Attendance Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topStreaks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No streak data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topStreaks.map((streak, idx) => (
                <div 
                  key={streak.studentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-warning text-warning-foreground' :
                      idx === 1 ? 'bg-muted-foreground/30 text-foreground' :
                      idx === 2 ? 'bg-accent/30 text-accent' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{streak.studentName}</p>
                      <p className="text-xs text-muted-foreground">{streak.className}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-accent" />
                    <span className="font-bold text-lg">{streak.currentStreak}</span>
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Attendance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {droppingStudents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-50 text-success" />
              <p className="text-sm">Great! No attendance concerns</p>
            </div>
          ) : (
            <div className="space-y-3">
              {droppingStudents.slice(0, 5).map((student) => (
                <div 
                  key={student.studentId}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div>
                    <p className="font-medium text-sm">{student.studentName}</p>
                    <p className="text-xs text-muted-foreground">{student.className}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <Badge variant="outline" className="text-destructive border-destructive/50">
                      {student.attendanceRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
