'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RepairOrderTable from '@/components/repair-orders/RepairOrderTable';
import RepairOrderForm from '@/components/RepairOrderForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function RepairOrdersPage() {
  const [repairOrders, setRepairOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRepairOrders();
  }, []);

  const fetchRepairOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/repair-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch repair orders');

      const data = await response.json();
      setRepairOrders(data.data.repairOrders);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load repair orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchRepairOrders();
    toast.success('Repair order created successfully');
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
        <h1 className="text-3xl font-bold text-slate-900">Repair Orders</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Repair Order
        </Button>
      </div>

      <RepairOrderTable orders={repairOrders} onRefresh={fetchRepairOrders} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Repair Order</DialogTitle>
          </DialogHeader>
          <RepairOrderForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}