'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ServiceRequestTable from '@/components/ServiceRequestTable';
import ServiceRequestForm from '@/components/service-requests/ServiceRequestForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/service-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch service requests');

      const data = await response.json();
      setServiceRequests(data.data.serviceRequests);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchServiceRequests();
    toast.success('Service request created successfully');
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
        <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <ServiceRequestTable requests={serviceRequests} onRefresh={fetchServiceRequests} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Service Request</DialogTitle>
          </DialogHeader>
          <ServiceRequestForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}