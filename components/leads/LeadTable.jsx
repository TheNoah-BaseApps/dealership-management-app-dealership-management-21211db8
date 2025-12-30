'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Trash2, Search, AlertCircle } from 'lucide-react';

export default function LeadTable({ onEdit, onDelete, refreshTrigger }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [refreshTrigger]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leads');

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const result = await response.json();

      if (result.success) {
        setLeads(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await fetch(`/api/leads/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete lead');
        }

        setLeads(leads.filter(l => l.id !== id));

        if (onDelete) {
          onDelete(id);
        }
      } catch (err) {
        console.error('Error deleting lead:', err);
        alert('Failed to delete lead: ' + err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'outline',
      converted: 'default',
      lost: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredLeads = leads.filter(lead =>
    lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.first_name} {lead.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{lead.email}</div>
                      {lead.phone && <div className="text-muted-foreground">{lead.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{lead.source?.replace('_', ' ')}</TableCell>
                  <TableCell>{lead.interest || '-'}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(lead.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}