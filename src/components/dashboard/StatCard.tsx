import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'coral' | 'blue' | 'purple' | 'teal' | 'green' | 'yellow' | 'pink';
}

const variantStyles = {
  coral: {
    bg: 'bg-stat-coral-bg',
    iconBg: 'bg-stat-coral',
    iconColor: 'text-primary-foreground',
  },
  blue: {
    bg: 'bg-stat-blue-bg',
    iconBg: 'bg-stat-blue',
    iconColor: 'text-primary-foreground',
  },
  purple: {
    bg: 'bg-stat-purple-bg',
    iconBg: 'bg-stat-purple',
    iconColor: 'text-primary-foreground',
  },
  teal: {
    bg: 'bg-stat-teal-bg',
    iconBg: 'bg-stat-teal',
    iconColor: 'text-primary-foreground',
  },
  green: {
    bg: 'bg-stat-green-bg',
    iconBg: 'bg-stat-green',
    iconColor: 'text-primary-foreground',
  },
  yellow: {
    bg: 'bg-stat-yellow-bg',
    iconBg: 'bg-stat-yellow',
    iconColor: 'text-foreground',
  },
  pink: {
    bg: 'bg-stat-pink-bg',
    iconBg: 'bg-stat-pink',
    iconColor: 'text-primary-foreground',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant }) => {
  const { isRTL } = useLanguage();
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-200",
      "flex items-center gap-4",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
        styles.iconBg
      )}>
        <Icon className={cn("w-7 h-7", styles.iconColor)} />
      </div>
      
      <div className={cn("flex flex-col", isRTL && "items-end")}>
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  );
};
