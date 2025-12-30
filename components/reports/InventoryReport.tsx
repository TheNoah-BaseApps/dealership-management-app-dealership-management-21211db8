'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InventoryReportProps {
  category?: string;
}

export default function InventoryReport({ category }: InventoryReportProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        
        const response = await fetch(`/api/reports/inventory?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch inventory report');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching inventory report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  if (loading) {
    return <div className="p-4">Loading inventory report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Report</CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{data.totalItems || 0}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{data.lowStock || 0}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${data.totalValue || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </CardContent>
    </Card>
  );
}