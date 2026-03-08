import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { JobOpenings } from '@/components/recruitment/JobOpenings';
import { Candidates } from '@/components/recruitment/Candidates';
import { Interviews } from '@/components/recruitment/Interviews';
import { HiringPipeline } from '@/components/recruitment/HiringPipeline';
import { RecruitmentReports } from '@/components/recruitment/RecruitmentReports';
import { RecruitmentDataProvider } from '@/contexts/RecruitmentDataContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Recruitment = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('openings');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'openings', label: t('recruitment.tabs.openings') },
    { id: 'candidates', label: t('recruitment.tabs.candidates') },
    { id: 'interviews', label: t('recruitment.tabs.interviews') },
    { id: 'pipeline', label: t('recruitment.tabs.pipeline') },
    { id: 'reports', label: t('recruitment.tabs.reports') },
  ];

  return (
    <DashboardLayout>
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('recruitment.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('recruitment.subtitle')}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <RecruitmentDataProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="openings"><JobOpenings /></TabsContent>
          <TabsContent value="candidates"><Candidates /></TabsContent>
          <TabsContent value="interviews"><Interviews /></TabsContent>
          <TabsContent value="pipeline"><HiringPipeline /></TabsContent>
          <TabsContent value="reports"><RecruitmentReports /></TabsContent>
        </Tabs>
      </RecruitmentDataProvider>
    </DashboardLayout>
  );
};

export default Recruitment;
