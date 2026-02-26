import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { PerformanceReviewForm } from '@/components/performance/PerformanceReviewForm';
import { PerformanceList } from '@/components/performance/PerformanceList';
import { QuarterlyReports } from '@/components/performance/QuarterlyReports';
import { cn } from '@/lib/utils';

const Performance = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl font-bold text-foreground">
            {t('performance.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('performance.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">{t('performance.tabs.dashboard')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('performance.tabs.reviews')}</TabsTrigger>
            <TabsTrigger value="newReview">{t('performance.tabs.newReview')}</TabsTrigger>
            <TabsTrigger value="reports">{t('performance.tabs.reports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <PerformanceList />
          </TabsContent>

          <TabsContent value="newReview" className="mt-6">
            <PerformanceReviewForm />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <QuarterlyReports />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
