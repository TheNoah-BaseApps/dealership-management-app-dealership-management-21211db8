'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesOrderFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function SalesOrderForm({ onSuccess, initialData }: SalesOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: initialData?.customer_id || '',
    vehicle_id: initialData?.vehicle_id || '',
    total_amount: initialData?.total_amount || '',
    status: initialData?.status || 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id ? `/api/sales/${initialData.id}` : '/api/sales';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save sales order');

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving sales order:', error);
      alert('Failed to save sales order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit' : 'Create'} Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_id">Customer ID</Label>
            <Input
              id="customer_id"
              name="customer_id"
              type="number"
              value={formData.customer_id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="vehicle_id">Vehicle ID</Label>
            <Input
              id="vehicle_id"
              name="vehicle_id"
              type="number"
              value={formData.vehicle_id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="total_amount">Total Amount</Label>
            <Input
              id="total_amount"
              name="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}