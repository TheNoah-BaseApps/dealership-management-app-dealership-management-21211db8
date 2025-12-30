'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceReportProps {
  startDate?: string;
  endDate?: string;
}

export default function ServiceReport({ startDate, endDate }: ServiceReportProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await fetch(`/api/reports/service?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch service report');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching service report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return <div className="p-4">Loading service report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Report</CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold">{data.totalAppointments || 0}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{data.completed || 0}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${data.revenue || 0}</p>
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