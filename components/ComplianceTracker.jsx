'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function ComplianceTracker() {
  const [compliance, setCompliance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/compliance?include=stats');

      if (!response.ok) {
        throw new Error('Failed to fetch compliance data');
      }

      const result = await response.json();

      if (result.success) {
        setCompliance(result.data || []);
        if (result.stats) {
          setStats(result.stats);
        } else {
          calculateStats(result.data || []);
        }
      } else {
        throw new Error(result.error || 'Failed to load compliance data');
      }
    } catch (err) {
      console.error('Error fetching compliance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const compliant = data.filter(item => item.status === 'compliant').length;
    const nonCompliant = data.filter(item => item.status === 'non_compliant').length;
    const pending = data.filter(item => item.status === 'pending').length;
    const overdue = data.filter(item => {
      if (!item.due_date) return false;
      return new Date(item.due_date) < new Date() && item.status !== 'compliant';
    }).length;

    setStats({
      total,
      compliant,
      non_compliant: nonCompliant,
      pending,
      overdue,
      compliance_rate: total > 0 ? (compliant / total) * 100 : 0
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      compliant: { label: 'Compliant', variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
      non_compliant: { label: 'Non-Compliant', variant: 'destructive', icon: AlertTriangle, color: 'text-red-500' },
      pending: { label: 'Pending', variant: 'secondary', icon: Clock, color: 'text-yellow-500' },
      in_review: { label: 'In Review', variant: 'outline', icon: FileText, color: 'text-blue-500' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-blue-600 bg-blue-100'
    };
    return colors[priority] || colors.medium;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
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

  const categorizedCompliance = {
    all: compliance,
    critical: compliance.filter(item => item.priority === 'critical'),
    overdue: compliance.filter(item => isOverdue(item.due_date) && item.status !== 'compliant'),
    upcoming: compliance.filter(item => {
      const days = getDaysUntilDue(item.due_date);
      return days !== null && days > 0 && days <= 30;
    })
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{stats?.compliance_rate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={stats?.compliance_rate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{stats?.compliant || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {stats?.total || 0} total items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Under review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Items</CardTitle>
          <CardDescription>Track regulatory and policy compliance requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({categorizedCompliance.all.length})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({categorizedCompliance.critical.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({categorizedCompliance.overdue.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({categorizedCompliance.upcoming.length})
              </TabsTrigger>
            </TabsList>

            {Object.entries(categorizedCompliance).map(([key, items]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No compliance items found</p>
                  </div>
                ) : (
                  items.map(item => {
                    const daysUntilDue = getDaysUntilDue(item.due_date);
                    const overdueItem = isOverdue(item.due_date);

                    return (
                      <Card key={item.id} className={overdueItem ? 'border-red-300' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{item.title}</h3>
                                {getStatusBadge(item.status)}
                                <Badge className={getPriorityColor(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </div>

                              {item.description && (
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="capitalize">
                                    {item.compliance_type?.replace('_', ' ')}
                                  </span>
                                </div>

                                {item.due_date && (
                                  <div className={`flex items-center gap-1 ${overdueItem ? 'text-red-600 font-semibold' : ''}`}>
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      Due: {formatDate(item.due_date)}
                                      {daysUntilDue !== null && (
                                        <span className="ml-1">
                                          ({overdueItem ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}

                                {item.last_review_date && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Last reviewed: {formatDate(item.last_review_date)}</span>
                                  </div>
                                )}
                              </div>

                              {item.assigned_to && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Assigned to:</span>{' '}
                                  <span className="font-medium">{item.assigned_to}</span>
                                </div>
                              )}

                              {item.notes && (
                                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}