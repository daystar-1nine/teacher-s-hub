import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  Video, 
  Lightbulb,
  Home,
  Settings,
  Search,
  Zap,
  Bell,
  BarChart3,
  Award,
  Target
} from 'lucide-react';

const commands = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', category: 'Navigation' },
  { icon: Users, label: 'Students', path: '/students', category: 'Navigation' },
  { icon: Calendar, label: 'Attendance', path: '/attendance', category: 'Navigation' },
  { icon: FileText, label: 'Exams', path: '/exams', category: 'Navigation' },
  { icon: ClipboardList, label: 'Homework', path: '/homework', category: 'Navigation' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback', category: 'Navigation' },
  { icon: Video, label: 'Meet', path: '/meet', category: 'Navigation' },
  { icon: Lightbulb, label: 'AI Explain', path: '/explain', category: 'Navigation' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', category: 'Navigation' },
  { icon: Zap, label: 'AI Risk Detection', path: '/risk-detection', category: 'AI Features' },
  { icon: FileText, label: 'Question Paper Generator', path: '/question-paper', category: 'AI Features' },
  { icon: Award, label: 'Student Badges', path: '/badges', category: 'Gamification' },
  { icon: Target, label: 'Student Goals', path: '/goals', category: 'Gamification' },
  { icon: Bell, label: 'Notifications', path: '/notifications', category: 'Actions' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([category, items], idx) => (
              <div key={category}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.path}
                      onSelect={() => runCommand(() => navigate(item.path))}
                      className="cursor-pointer"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
