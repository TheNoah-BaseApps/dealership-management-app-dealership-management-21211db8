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

interface Part {
  id: string;
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  status: string;
  location?: string;
}

interface PartTableProps {
  data?: Part[];
  onEdit?: (part: Part) => void;
  onDelete?: (id: string) => void;
}

export default function PartTable({ data = [], onEdit, onDelete }: PartTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-500';
      case 'low_stock':
        return 'bg-yellow-500';
      case 'out_of_stock':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No parts found
              </TableCell>
            </TableRow>
          ) : (
            data.map((part) => (
              <TableRow key={part.id}>
                <TableCell className="font-medium">{part.part_number}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.description || '-'}</TableCell>
                <TableCell>{part.quantity}</TableCell>
                <TableCell>${part.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(part.status)}>
                    {part.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{part.location || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(part)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(part.id)}
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