import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, UserCheck, UserX, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  counts: { all: number; active: number; inactive: number; suspended: number };
}

export const EmployeeFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
}: EmployeeFiltersProps) => {
  const { t, isRTL } = useLanguage();

  const filters: { key: FilterStatus; label: string; icon: typeof Users; count: number }[] = [
    { key: 'all', label: t('employees.filter.all'), icon: Users, count: counts.all },
    { key: 'active', label: t('employees.filter.active'), icon: UserCheck, count: counts.active },
    { key: 'inactive', label: t('employees.filter.inactive'), icon: UserX, count: counts.inactive },
    { key: 'suspended', label: t('employees.filter.suspended'), icon: UserMinus, count: counts.suspended },
  ];

  return (
    <div className="border-2 border-primary rounded-xl p-5 space-y-4 bg-card">
      {/* Search Input */}
      <div className="relative">
        <Search
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground",
            isRTL ? "right-4" : "left-4"
          )}
        />
        <Input
          placeholder={t('employees.searchAdvanced')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "h-12 text-base border-2 rounded-lg",
            isRTL ? "pr-12 text-right" : "pl-12"
          )}
        />
      </div>

      {/* Filter Buttons */}
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", isRTL && "direction-rtl")}>
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all font-medium",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50",
                isRTL && "flex-row-reverse"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{filter.label}</span>
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={cn(
                  "text-xs min-w-[24px] justify-center",
                  isActive && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {filter.count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};
