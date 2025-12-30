'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesReport from '@/components/reports/SalesReport';
import ServiceReport from '@/components/reports/ServiceReport';
import InventoryReport from '@/components/reports/InventoryReport';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="service">Service Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <SalesReport />
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <ServiceReport />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}