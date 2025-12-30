'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EngagementTimeline from '@/components/EngagementTimeline';
import EngagementForm from '@/components/engagement/EngagementForm';
import EngagementTable from '@/components/engagement/EngagementTable';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerEngagementPage() {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-engagements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch engagements');

      const data = await response.json();
      setEngagements(data.data.engagements);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load engagements');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchEngagements();
    toast.success('Engagement created successfully');
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
        <h1 className="text-3xl font-bold text-slate-900">Customer Engagement</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Engagement
        </Button>
      </div>

      <EngagementTimeline engagements={engagements} />
      <EngagementTable engagements={engagements} onRefresh={fetchEngagements} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Customer Engagement</DialogTitle>
          </DialogHeader>
          <EngagementForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}