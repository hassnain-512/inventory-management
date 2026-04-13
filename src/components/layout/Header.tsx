import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/features/settings/settingsSlice';
import { useEffect } from 'react';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(state => state.settings);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
