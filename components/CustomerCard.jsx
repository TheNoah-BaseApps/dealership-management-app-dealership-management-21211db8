'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, User, Calendar } from 'lucide-react';

export default function CustomerCard({ customer }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{customer.name}</CardTitle>
          <Badge>{customer.customer_type || 'Individual'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-4 w-4" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{customer.address}</span>
            </div>
          )}
          {customer.sales_rep_name && (
            <div className="flex items-center gap-2 text-slate-600">
              <User className="h-4 w-4" />
              <span>Rep: {customer.sales_rep_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>
              Joined: {new Date(customer.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}