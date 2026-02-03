import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingRecords } from '@/components/training/TrainingRecords';
import { Trainers } from '@/components/training/Trainers';
import { CoursesSyllabus } from '@/components/training/CoursesSyllabus';
import { CoursesList } from '@/components/training/CoursesList';
import { TrainingPlan } from '@/components/training/TrainingPlan';

const Training = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('training.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('training.subtitle')}</p>
        </div>

        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="records">{t('training.tabs.records')}</TabsTrigger>
            <TabsTrigger value="trainers">{t('training.tabs.trainers')}</TabsTrigger>
            <TabsTrigger value="syllabus">{t('training.tabs.syllabus')}</TabsTrigger>
            <TabsTrigger value="courses">{t('training.tabs.courses')}</TabsTrigger>
            <TabsTrigger value="plan">{t('training.tabs.plan')}</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="mt-6">
            <TrainingRecords />
          </TabsContent>

          <TabsContent value="trainers" className="mt-6">
            <Trainers />
          </TabsContent>

          <TabsContent value="syllabus" className="mt-6">
            <CoursesSyllabus />
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <CoursesList />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <TrainingPlan />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Training;
