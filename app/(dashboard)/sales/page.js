'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SalesOrderTable from '@/components/sales/SalesOrderTable';
import SalesOrderForm from '@/components/sales/SalesOrderForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesPage() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sales orders');

      const data = await response.json();
      setSalesOrders(data.data.salesOrders);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchSalesOrders();
    toast.success('Sales order created successfully');
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
        <h1 className="text-3xl font-bold text-slate-900">Sales Orders</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <SalesOrderTable orders={salesOrders} onRefresh={fetchSalesOrders} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Sales Order</DialogTitle>
          </DialogHeader>
          <SalesOrderForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}