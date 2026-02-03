import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, X, Edit2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Trainer {
  id: string;
  provider: string;
  title: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  officeNumber: string;
  mobNumber: string;
  siteAddress: string;
  status: 'active' | 'inactive';
  photo?: string;
}

const mockTrainers: Trainer[] = [
  { id: '1', provider: 'Aeroflot', title: 'Mr.', firstName: 'Moatasem', lastName: 'Moahmoud', jobTitle: 'Director Operations & Training', email: 'mmahmoud@linkagency.com', officeNumber: '0227352025 / 27352045', mobNumber: '0127944514/0100029075', siteAddress: '', status: 'active' },
  { id: '2', provider: 'Link Aero Training', title: 'Dr.', firstName: 'Ahmed', lastName: 'Hassan', jobTitle: 'Senior Trainer', email: 'ahmed.hassan@link.com', officeNumber: '0227352026', mobNumber: '01012345678', siteAddress: 'Cairo Office', status: 'active' },
  { id: '3', provider: 'EgyptAir Training', title: 'Eng.', firstName: 'Mohamed', lastName: 'Ali', jobTitle: 'Technical Trainer', email: 'mali@egyptair.com', officeNumber: '0227352027', mobNumber: '01098765432', siteAddress: 'Airport', status: 'inactive' },
];

export const Trainers = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<Trainer>>({
    id: '',
    provider: '',
    title: 'Mr.',
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    officeNumber: '',
    mobNumber: '',
    siteAddress: '',
    status: 'active',
  });

  const handleNewTrainer = () => {
    setIsAddMode(true);
    setSelectedTrainer(null);
    setFormData({
      id: String(trainers.length + 1),
      provider: '',
      title: 'Mr.',
      firstName: '',
      lastName: '',
      jobTitle: '',
      email: '',
      officeNumber: '',
      mobNumber: '',
      siteAddress: '',
      status: 'active',
    });
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setFormData(trainer);
    setIsAddMode(false);
    setCurrentIndex(trainers.findIndex(t => t.id === trainer.id));
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.provider) {
      toast({
        title: t('common.error'),
        description: t('training.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (isAddMode) {
      setTrainers([...trainers, formData as Trainer]);
      toast({
        title: t('common.success'),
        description: t('training.trainerAdded'),
      });
    } else {
      setTrainers(trainers.map(tr => tr.id === formData.id ? formData as Trainer : tr));
      toast({
        title: t('common.success'),
        description: t('training.trainerUpdated'),
      });
    }
    setSelectedTrainer(null);
    setIsAddMode(false);
  };

  const handleSaveAndNew = () => {
    handleSave();
    handleNewTrainer();
  };

  const handleDelete = () => {
    if (formData.id) {
      setTrainers(trainers.filter(tr => tr.id !== formData.id));
      setSelectedTrainer(null);
      setIsAddMode(false);
      toast({
        title: t('common.success'),
        description: t('training.trainerDeleted'),
      });
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(trainers.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    setFormData(trainers[newIndex]);
    setSelectedTrainer(trainers[newIndex]);
  };

  const showForm = isAddMode || selectedTrainer;

  return (
    <div className="space-y-6">
      {!showForm ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('training.trainers.list')}</h2>
            <Button onClick={handleNewTrainer}>
              <Plus className="h-4 w-4 mr-2" />
              {t('training.trainers.add')}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('training.trainers.photo')}</TableHead>
                    <TableHead>{t('training.trainers.name')}</TableHead>
                    <TableHead>{t('training.trainers.provider')}</TableHead>
                    <TableHead>{t('training.trainers.jobTitle')}</TableHead>
                    <TableHead>{t('training.trainers.email')}</TableHead>
                    <TableHead>{t('training.trainers.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map(trainer => (
                    <TableRow key={trainer.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={trainer.photo} />
                          <AvatarFallback>{trainer.firstName.charAt(0)}{trainer.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {trainer.title} {trainer.firstName} {trainer.lastName}
                      </TableCell>
                      <TableCell>{trainer.provider}</TableCell>
                      <TableCell>{trainer.jobTitle}</TableCell>
                      <TableCell>{trainer.email}</TableCell>
                      <TableCell>
                        <Badge variant={trainer.status === 'active' ? 'default' : 'secondary'}>
                          {trainer.status === 'active' ? t('training.status.onJob') : t('training.status.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEditTrainer(trainer)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isAddMode ? t('training.trainers.addNew') : t('training.trainers.edit')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTrainer(null); setIsAddMode(false); }}>
                <X className="h-4 w-4" />
              </Button>
              {!isAddMode && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} disabled={currentIndex === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} disabled={currentIndex === trainers.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={formData.photo} />
                  <AvatarFallback className="text-3xl">
                    {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  {t('training.trainers.uploadPhoto')}
                </Button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('training.trainers.id')}</Label>
                  <Input value={formData.id} disabled className="bg-muted" />
                </div>
                <div className="col-span-2">
                  <Label>{t('training.trainers.provider')}</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.title')}</Label>
                  <Select value={formData.title} onValueChange={(val) => setFormData({ ...formData, title: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Eng.">Eng.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('training.trainers.firstName')}</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.lastName')}</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{t('training.trainers.jobTitle')}</Label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.email')}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.officeNumber')}</Label>
                  <Input
                    value={formData.officeNumber}
                    onChange={(e) => setFormData({ ...formData, officeNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.mobNumber')}</Label>
                  <Input
                    value={formData.mobNumber}
                    onChange={(e) => setFormData({ ...formData, mobNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.siteAddress')}</Label>
                  <Input
                    value={formData.siteAddress}
                    onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('training.trainers.status')}</Label>
                  <Select value={formData.status} onValueChange={(val: 'active' | 'inactive') => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('training.status.onJob')}</SelectItem>
                      <SelectItem value="inactive">{t('training.status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4 border-t">
              {!isAddMode && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('training.trainers.deleteRecord')}
                </Button>
              )}
              <Button variant="outline" onClick={handleSaveAndNew}>
                <Save className="h-4 w-4 mr-2" />
                {t('training.trainers.saveAndNew')}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedTrainer(null); setIsAddMode(false); }}>
                <X className="h-4 w-4 mr-2" />
                {t('training.trainers.discard')}
              </Button>
            </div>

            {!isAddMode && (
              <div className="flex items-center justify-start text-sm text-muted-foreground pt-2">
                {t('training.trainers.record')} {currentIndex + 1} {t('common.of')} {trainers.length}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
