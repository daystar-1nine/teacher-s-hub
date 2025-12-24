import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Flame, Star, Trophy, Target, BookOpen, Clock, CheckCircle } from 'lucide-react';

export interface StudentBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface StudentGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  goal_type: string;
  deadline: string;
  status: string;
}

interface GamificationPanelProps {
  badges: StudentBadge[];
  goals: StudentGoal[];
}

const badgeIcons: Record<string, React.ReactNode> = {
  attendance_streak: <Flame className="h-6 w-6" />,
  homework_star: <Star className="h-6 w-6" />,
  exam_topper: <Trophy className="h-6 w-6" />,
  perfect_week: <CheckCircle className="h-6 w-6" />,
  default: <Award className="h-6 w-6" />
};

const badgeColors: Record<string, string> = {
  attendance_streak: 'bg-accent text-accent-foreground',
  homework_star: 'bg-warning text-warning-foreground',
  exam_topper: 'bg-success text-success-foreground',
  perfect_week: 'bg-primary text-primary-foreground',
  default: 'bg-muted text-muted-foreground'
};

const goalIcons: Record<string, React.ReactNode> = {
  attendance: <Clock className="h-4 w-4" />,
  exam: <BookOpen className="h-4 w-4" />,
  homework: <CheckCircle className="h-4 w-4" />,
  default: <Target className="h-4 w-4" />
};

export function GamificationPanel({ badges, goals }: GamificationPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No badges earned yet</p>
              <p className="text-xs">Complete tasks to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${badgeColors[badge.badge_type] || badgeColors.default}`}>
                    {badgeIcons[badge.badge_type] || badgeIcons.default}
                  </div>
                  <p className="text-xs font-medium text-center line-clamp-2">{badge.badge_name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            My Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No goals set yet</p>
              <p className="text-xs">Ask your teacher to set goals!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                const isCompleted = goal.status === 'completed';

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {goalIcons[goal.goal_type] || goalIcons.default}
                        <span className="text-sm font-medium">{goal.title}</span>
                      </div>
                      <Badge variant={isCompleted ? 'default' : 'outline'} className={isCompleted ? 'bg-success' : ''}>
                        {isCompleted ? 'Completed' : `${goal.current_value}/${goal.target_value}`}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
