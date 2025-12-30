'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Send,
  Inbox,
  Archive,
  Star,
  Search,
  AlertCircle,
  User,
  Calendar,
  Filter
} from 'lucide-react';

export default function CommunicationHub() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/communications?sortBy=date&order=desc');

      if (!response.ok) {
        throw new Error('Failed to fetch communications');
      }

      const result = await response.json();

      if (result.success) {
        setCommunications(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load communications');
      }
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: Mail,
      phone: Phone,
      sms: MessageSquare,
      meeting: Calendar,
      note: MessageSquare
    };
    return icons[type] || MessageSquare;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { label: 'Sent', variant: 'default' },
      received: { label: 'Received', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'outline' },
      failed: { label: 'Failed', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = 
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || comm.type === filterType;

    return matchesSearch && matchesType;
  });

  const categorizedComms = {
    all: filteredCommunications,
    inbox: filteredCommunications.filter(c => c.direction === 'inbound'),
    sent: filteredCommunications.filter(c => c.direction === 'outbound'),
    starred: filteredCommunications.filter(c => c.is_starred)
  };

  const stats = {
    total: communications.length,
    unread: communications.filter(c => !c.is_read).length,
    sent: communications.filter(c => c.direction === 'outbound').length,
    received: communications.filter(c => c.direction === 'inbound').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <Inbox className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Received</p>
                <p className="text-2xl font-bold text-purple-600">{stats.received}</p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communications</CardTitle>
              <CardDescription>Manage all customer communications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="sms">SMS</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">
                  <Inbox className="h-4 w-4 mr-2" />
                  All ({categorizedComms.all.length})
                </TabsTrigger>
                <TabsTrigger value="inbox">
                  <Mail className="h-4 w-4 mr-2" />
                  Inbox ({categorizedComms.inbox.length})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  <Send className="h-4 w-4 mr-2" />
                  Sent ({categorizedComms.sent.length})
                </TabsTrigger>
                <TabsTrigger value="starred">
                  <Star className="h-4 w-4 mr-2" />
                  Starred ({categorizedComms.starred.length})
                </TabsTrigger>
              </TabsList>

              {Object.entries(categorizedComms).map(([key, items]) => (
                <TabsContent key={key} value={key} className="space-y-2">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No communications found</p>
                    </div>
                  ) : (
                    items.map(comm => {
                      const TypeIcon = getTypeIcon(comm.type);

                      return (
                        <Card key={comm.id} className={`cursor-pointer hover:bg-muted/50 transition-colors ${!comm.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-full ${comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                <TypeIcon className={`h-5 w-5 ${comm.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'}`} />
                              </div>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className={`font-semibold ${!comm.is_read ? 'text-primary' : ''}`}>
                                        {comm.subject || 'No subject'}
                                      </h4>
                                      {getStatusBadge(comm.status)}
                                      {comm.is_starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <User className="h-3 w-3" />
                                      <span>{comm.customer_name || 'Unknown'}</span>
                                      <span>•</span>
                                      <span className="capitalize">{comm.type}</span>
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {formatDate(comm.communication_date)}
                                  </span>
                                </div>

                                {comm.message && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {comm.message}
                                  </p>
                                )}

                                {comm.notes && (
                                  <div className="bg-muted/50 rounded p-2 text-sm">
                                    {comm.notes}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}