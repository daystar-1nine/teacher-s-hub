import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ClipboardCheck, 
  FileText, 
  PlusCircle,
  Video,
  Send
} from 'lucide-react';

const quickActions = [
  { 
    icon: ClipboardCheck, 
    label: 'Mark Attendance', 
    path: '/attendance',
    color: 'bg-primary/10 text-primary hover:bg-primary/20'
  },
  { 
    icon: PlusCircle, 
    label: 'Assign Homework', 
    path: '/homework',
    color: 'bg-accent/10 text-accent hover:bg-accent/20'
  },
  { 
    icon: FileText, 
    label: 'Add Exam Marks', 
    path: '/exams',
    color: 'bg-success/10 text-success hover:bg-success/20'
  },
  { 
    icon: UserPlus, 
    label: 'Add Student', 
    path: '/students',
    color: 'bg-warning/10 text-warning hover:bg-warning/20'
  },
  { 
    icon: Video, 
    label: 'Start Meet', 
    path: '/meet',
    color: 'bg-destructive/10 text-destructive hover:bg-destructive/20'
  },
  { 
    icon: Send, 
    label: 'Send Feedback', 
    path: '/feedback',
    color: 'bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20'
  },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={`h-auto flex-col gap-2 py-4 ${action.color} transition-all duration-200`}
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
