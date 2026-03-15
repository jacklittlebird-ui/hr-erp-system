import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, X, Edit2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trainer {
  id: string;
  provider: string;
  name: string;
  jobTitle: string;
  email: string;
  mobNumber: string;
  siteAddress: string;
  status: 'active' | 'inactive';
  photo?: string;
}

export const Trainers = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const ar = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<Trainer>>({
    id: '', provider: '', name: '',
    jobTitle: '', email: '', mobNumber: '', siteAddress: '', status: 'active',
  });

  const handleNewTrainer = () => {
    setIsAddMode(true); setSelectedTrainer(null);
    setFormData({ id: String(trainers.length + 1), provider: '', name: '', jobTitle: '', email: '', mobNumber: '', siteAddress: '', status: 'active' });
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer); setFormData(trainer); setIsAddMode(false);
    setCurrentIndex(trainers.findIndex(t => t.id === trainer.id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.provider) {
      toast({ title: t('common.error'), description: t('training.fillRequired'), variant: 'destructive' }); return;
    }
    if (isAddMode) {
      setTrainers([...trainers, formData as Trainer]);
      toast({ title: t('common.success'), description: t('training.trainerAdded') });
    } else {
      setTrainers(trainers.map(tr => tr.id === formData.id ? formData as Trainer : tr));
      toast({ title: t('common.success'), description: t('training.trainerUpdated') });
    }
    setSelectedTrainer(null); setIsAddMode(false);
  };

  const handleSaveAndNew = () => { handleSave(); handleNewTrainer(); };

  const handleDelete = () => {
    if (formData.id) {
      setTrainers(trainers.filter(tr => tr.id !== formData.id));
      setSelectedTrainer(null); setIsAddMode(false);
      toast({ title: t('common.success'), description: t('training.trainerDeleted') });
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? Math.max(0, currentIndex - 1) : Math.min(trainers.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex); setFormData(trainers[newIndex]); setSelectedTrainer(trainers[newIndex]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let w = img.width, h = img.height;
        if (w > h) { h = (h / w) * maxSize; w = maxSize; } else { w = (w / h) * maxSize; h = maxSize; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, photo: dataUrl });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const showForm = isAddMode || selectedTrainer;

  return (
    <div dir="rtl" className="space-y-6">
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      {!showForm ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('training.trainers.list')}</h2>
            <Button onClick={handleNewTrainer}><Plus className="h-4 w-4 mr-2" />{t('training.trainers.add')}</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('training.trainers.photo')}</TableHead>
                <TableHead>{t('training.trainers.name')}</TableHead>
                <TableHead>{t('training.trainers.provider')}</TableHead>
                <TableHead>{t('training.trainers.jobTitle')}</TableHead>
                <TableHead>{t('training.trainers.email')}</TableHead>
                <TableHead>{t('training.trainers.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {trainers.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{ar ? 'لا يوجد مدربون' : 'No trainers'}</TableCell></TableRow>
                ) : trainers.map(trainer => (
                  <TableRow key={trainer.id}>
                    <TableCell><Avatar><AvatarImage src={trainer.photo} /><AvatarFallback>{trainer.name?.charAt(0)}</AvatarFallback></Avatar></TableCell>
                    <TableCell className="font-medium">{trainer.name}</TableCell>
                    <TableCell>{trainer.provider}</TableCell>
                    <TableCell>{trainer.jobTitle}</TableCell>
                    <TableCell>{trainer.email}</TableCell>
                    <TableCell><Badge variant={trainer.status === 'active' ? 'default' : 'secondary'}>{trainer.status === 'active' ? t('training.status.onJob') : t('training.status.inactive')}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleEditTrainer(trainer)}><Edit2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}</TableBody>
            </Table>
          </CardContent></Card>
        </>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isAddMode ? t('training.trainers.addNew') : t('training.trainers.edit')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTrainer(null); setIsAddMode(false); }}><X className="h-4 w-4" /></Button>
              {!isAddMode && (<>
                <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} disabled={currentIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} disabled={currentIndex === trainers.length - 1}><ChevronRight className="h-4 w-4" /></Button>
              </>)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-32 h-32 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={formData.photo} />
                  <AvatarFallback className="text-3xl">{formData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />{ar ? 'رفع صورة' : 'Upload Photo'}
                </Button>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div><Label>{t('training.trainers.provider')}</Label><Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} /></div>
                <div className="col-span-2"><Label>{ar ? 'الاسم' : 'Name'}</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="col-span-2"><Label>{t('training.trainers.jobTitle')}</Label><Input value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} /></div>
                <div><Label>{t('training.trainers.email')}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div><Label>{t('training.trainers.mobNumber')}</Label><Input value={formData.mobNumber} onChange={(e) => setFormData({ ...formData, mobNumber: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex justify-center gap-4 pt-4 border-t">
              {!isAddMode && (<Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" />{t('training.trainers.deleteRecord')}</Button>)}
              <Button variant="outline" onClick={handleSaveAndNew}><Save className="h-4 w-4 mr-2" />{t('training.trainers.saveAndNew')}</Button>
              <Button variant="outline" onClick={() => { setSelectedTrainer(null); setIsAddMode(false); }}><X className="h-4 w-4 mr-2" />{t('training.trainers.discard')}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
