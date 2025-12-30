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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Engagement {
  id: string;
  customer_name: string;
  type: string;
  campaign: string;
  status: string;
  date: string;
  points?: number;
}

interface EngagementTableProps {
  data?: Engagement[];
  onEdit?: (engagement: Engagement) => void;
  onDelete?: (id: string) => void;
}

export default function EngagementTable({ data = [], onEdit, onDelete }: EngagementTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No engagement data found
              </TableCell>
            </TableRow>
          ) : (
            data.map((engagement) => (
              <TableRow key={engagement.id}>
                <TableCell className="font-medium">{engagement.customer_name}</TableCell>
                <TableCell>{engagement.type}</TableCell>
                <TableCell>{engagement.campaign}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(engagement.status)}>
                    {engagement.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(engagement.date).toLocaleDateString()}</TableCell>
                <TableCell>{engagement.points || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(engagement)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(engagement.id)}
                      >
                        Delete
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