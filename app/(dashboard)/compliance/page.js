'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ComplianceTracker from '@/components/ComplianceTracker';
import ComplianceTable from '@/components/compliance/ComplianceTable';
import ComplianceForm from '@/components/compliance/ComplianceForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CompliancePage() {
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchComplianceRecords();
  }, []);

  const fetchComplianceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/compliance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch compliance records');

      const data = await response.json();
      setComplianceRecords(data.data.complianceRecords);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchComplianceRecords();
    toast.success('Compliance record created successfully');
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
        <h1 className="text-3xl font-bold text-slate-900">Compliance Tracking</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </div>

      <ComplianceTracker records={complianceRecords} />
      <ComplianceTable records={complianceRecords} onRefresh={fetchComplianceRecords} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Compliance Record</DialogTitle>
          </DialogHeader>
          <ComplianceForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}