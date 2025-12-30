'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerCard from '@/components/CustomerCard';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch customer');

      const data = await response.json();
      setCustomer(data.data.customer);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load customer');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-slate-900">Customer Details</h1>
      </div>

      {customer && <CustomerCard customer={customer} />}
    </div>
  );
}