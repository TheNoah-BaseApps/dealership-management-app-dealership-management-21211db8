'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  ShoppingCart,
  Wrench,
  Car,
  AlertCircle,
  Calendar,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data || getDefaultAnalytics());
      } else {
        throw new Error(result.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      setAnalytics(getDefaultAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAnalytics = () => ({
    revenue: {
      total: 0,
      change: 0,
      trend: 'up'
    },
    customers: {
      total: 0,
      new: 0,
      change: 0
    },
    sales: {
      total: 0,
      pending: 0,
      completed: 0
    },
    service: {
      total: 0,
      in_progress: 0,
      completed: 0
    },
    inventory: {
      total: 0,
      available: 0,
      sold: 0
    },
    topPerformers: {
      vehicles: [],
      services: [],
      salespeople: []
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.revenue?.total)}</p>
                <div className={`flex items-center gap-1 text-sm mt-1 ${analytics.revenue?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenue?.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{formatPercent(analytics.revenue?.change || 0)}</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{analytics.customers?.total || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  +{analytics.customers?.new || 0} new this {period}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Orders</p>
                <p className="text-2xl font-bold">{analytics.sales?.total || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.sales?.completed || 0} completed
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Orders</p>
                <p className="text-2xl font-bold">{analytics.service?.total || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.service?.in_progress || 0} in progress
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Vehicles</CardTitle>
            <CardDescription>Best performing vehicles this {period}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPerformers?.vehicles?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformers.vehicles.slice(0, 5).map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.sales_count} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(vehicle.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No vehicle sales data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>Most requested services this {period}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPerformers?.services?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformers.services.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{service.service_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(service.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No service data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Vehicles</span>
                <span className="font-semibold">{analytics.inventory?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-green-600">{analytics.inventory?.available || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sold</span>
                <span className="font-semibold text-blue-600">{analytics.inventory?.sold || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{analytics.sales?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">{analytics.sales?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-yellow-600">{analytics.sales?.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{analytics.service?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">{analytics.service?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-semibold text-blue-600">{analytics.service?.in_progress || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}