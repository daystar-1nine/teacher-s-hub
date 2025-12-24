import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={toggleTheme}
      className={cn(
        'relative overflow-hidden group',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={cn(
          iconSize,
          'absolute transition-all duration-500 rotate-0 scale-100',
          isDark && '-rotate-90 scale-0'
        )}
      />
      <Moon
        className={cn(
          iconSize,
          'absolute transition-all duration-500 rotate-90 scale-0',
          isDark && 'rotate-0 scale-100'
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
