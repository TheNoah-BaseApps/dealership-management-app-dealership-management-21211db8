'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ServiceRequestTable({ requests, onRefresh }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'Closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/service-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution_status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      setSelectedRequest(null);
      setNewStatus('');
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No service requests found
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.service_request_id}</TableCell>
                <TableCell>{request.customer_name}</TableCell>
                <TableCell>{request.issue_type}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(request.priority_level)}>
                    {request.priority_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.resolution_status)}>
                    {request.resolution_status}
                  </Badge>
                </TableCell>
                <TableCell>{request.agent_name || 'Unassigned'}</TableCell>
                <TableCell>
                  {new Date(request.request_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Request Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Request: {selectedRequest?.service_request_id}</p>
              <p className="text-sm text-slate-500">{selectedRequest?.customer_name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateStatus} disabled={updating || !newStatus} className="w-full">
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}