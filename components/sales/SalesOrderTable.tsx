'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface SalesOrder {
  id: number;
  customer_name: string;
  vehicle_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface SalesOrderTableProps {
  onEdit?: (order: SalesOrder) => void;
  onView?: (order: SalesOrder) => void;
}

export default function SalesOrderTable({ onEdit, onView }: SalesOrderTableProps) {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/sales');
        if (!response.ok) throw new Error('Failed to fetch sales orders');
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching sales orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-4">Loading sales orders...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No sales orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.vehicle_name}</TableCell>
                <TableCell>${order.total_amount?.toFixed(2)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onView && (
                      <Button variant="outline" size="sm" onClick={() => onView(order)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}