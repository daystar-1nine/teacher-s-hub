import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  ClipboardCheck, 
  Award,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'exam' | 'homework' | 'attendance' | 'badge' | 'goal';
  title: string;
  description: string;
  date: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
}

interface ProgressTimelineProps {
  events: TimelineEvent[];
  studentName?: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  exam: <FileText className="h-4 w-4" />,
  homework: <ClipboardCheck className="h-4 w-4" />,
  attendance: <Calendar className="h-4 w-4" />,
  badge: <Award className="h-4 w-4" />,
  goal: <TrendingUp className="h-4 w-4" />
};

const statusColors: Record<string, string> = {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  error: 'bg-destructive text-destructive-foreground',
  info: 'bg-primary text-primary-foreground'
};

export function ProgressTimeline({ events, studentName }: ProgressTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {studentName ? `${studentName}'s Progress` : 'Progress Timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No timeline events yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {sortedEvents.map((event, idx) => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${statusColors[event.status || 'info']}`}>
                      {eventIcons[event.type]}
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {event.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {format(new Date(event.date), 'MMM d')}
                        </Badge>
                      </div>
                      {event.metadata && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.metadata.score && (
                            <Badge variant="secondary" className="text-xs">
                              Score: {event.metadata.score}%
                            </Badge>
                          )}
                          {event.metadata.grade && (
                            <Badge variant="secondary" className="text-xs">
                              Grade: {event.metadata.grade}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
