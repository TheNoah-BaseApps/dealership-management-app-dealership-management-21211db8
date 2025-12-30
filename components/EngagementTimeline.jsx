'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  ShoppingCart, 
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

const engagementIcons = {
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  meeting: Calendar,
  purchase: ShoppingCart,
  service: Wrench,
  other: AlertCircle
};

const engagementColors = {
  email: 'bg-blue-100 text-blue-700 border-blue-200',
  phone: 'bg-green-100 text-green-700 border-green-200',
  sms: 'bg-purple-100 text-purple-700 border-purple-200',
  meeting: 'bg-orange-100 text-orange-700 border-orange-200',
  purchase: 'bg-pink-100 text-pink-700 border-pink-200',
  service: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200'
};

export default function EngagementTimeline({ customerId }) {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    fetchEngagements();
  }, [customerId]);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/engagements?customerId=${customerId}&sortBy=date&order=desc`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch engagement timeline');
      }

      const result = await response.json();
      
      if (result.success) {
        setEngagements(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load engagements');
      }
    } catch (err) {
      console.error('Error fetching engagements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', variant: 'default', icon: CheckCircle2, color: 'bg-green-500' },
      pending: { label: 'Pending', variant: 'secondary', icon: Clock, color: 'bg-yellow-500' },
      scheduled: { label: 'Scheduled', variant: 'outline', icon: Calendar, color: 'bg-blue-500' },
      cancelled: { label: 'Cancelled', variant: 'destructive', icon: AlertCircle, color: 'bg-red-500' }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Timeline</CardTitle>
          <CardDescription>Loading customer interaction history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Timeline</CardTitle>
        <CardDescription>
          Complete history of customer interactions and touchpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        {engagements.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No engagement history available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Interactions will appear here as they occur
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {engagements.map((engagement, index) => {
                const Icon = engagementIcons[engagement.type] || engagementIcons.other;
                const colorClass = engagementColors[engagement.type] || engagementColors.other;

                return (
                  <div key={engagement.id} className="relative flex gap-4 pl-12">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-base">{engagement.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(engagement.engagement_date)}
                          </p>
                        </div>
                        {getStatusBadge(engagement.status)}
                      </div>

                      {engagement.description && (
                        <p className="text-sm text-muted-foreground">
                          {engagement.description}
                        </p>
                      )}

                      {engagement.notes && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <p className="text-sm">{engagement.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="capitalize">
                          Type: <strong>{engagement.type.replace('_', ' ')}</strong>
                        </span>
                        {engagement.duration && (
                          <span>
                            Duration: <strong>{engagement.duration} min</strong>
                          </span>
                        )}
                        {engagement.outcome && (
                          <span className="capitalize">
                            Outcome: <strong>{engagement.outcome}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}