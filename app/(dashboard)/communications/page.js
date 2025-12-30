'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CommunicationHub from '@/components/CommunicationHub';
import CommunicationTable from '@/components/communications/CommunicationTable';
import CommunicationForm from '@/components/communications/CommunicationForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/communications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch communications');

      const data = await response.json();
      setCommunications(data.data.communications);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchCommunications();
    toast.success('Communication logged successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Communications</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Communication
        </Button>
      </div>

      <CommunicationHub communications={communications} />
      <CommunicationTable communications={communications} onRefresh={fetchCommunications} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>
          <CommunicationForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}