'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppointmentFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

export default function AppointmentForm({ onSubmit, initialData }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    customer_name: initialData?.customer_name || '',
    customer_email: initialData?.customer_email || '',
    customer_phone: initialData?.customer_phone || '',
    vehicle_info: initialData?.vehicle_info || '',
    service_type: initialData?.service_type || '',
    appointment_date: initialData?.appointment_date || '',
    appointment_time: initialData?.appointment_time || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Service Appointment</CardTitle>
        <CardDescription>Fill in the details to schedule a service appointment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => handleChange('customer_phone', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle_info">Vehicle Information</Label>
              <Input
                id="vehicle_info"
                value={formData.vehicle_info}
                onChange={(e) => handleChange('vehicle_info', e.target.value)}
                placeholder="e.g., 2020 Honda Civic"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleChange('service_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="general_maintenance">General Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Appointment Date</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleChange('appointment_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Appointment Time</Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleChange('appointment_time', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any specific concerns or requests?"
              rows={4}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Schedule Appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}