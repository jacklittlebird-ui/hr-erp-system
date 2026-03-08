import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AssetRegistry } from '@/components/assets/AssetRegistry';
import { AssetAssignment } from '@/components/assets/AssetAssignment';
import { AssetMaintenance } from '@/components/assets/AssetMaintenance';
import { AssetReports } from '@/components/assets/AssetReports';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Assets = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('registry');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'registry', label: t('assets.tabs.registry') },
    { id: 'assignment', label: t('assets.tabs.assignment') },
    { id: 'maintenance', label: t('assets.tabs.maintenance') },
    { id: 'reports', label: t('assets.tabs.reports') },
  ];

  return (
    <DashboardLayout>
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('assets.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('assets.subtitle')}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

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

        <TabsContent value="registry"><AssetRegistry /></TabsContent>
        <TabsContent value="assignment"><AssetAssignment /></TabsContent>
        <TabsContent value="maintenance"><AssetMaintenance /></TabsContent>
        <TabsContent value="reports"><AssetReports /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Assets;
