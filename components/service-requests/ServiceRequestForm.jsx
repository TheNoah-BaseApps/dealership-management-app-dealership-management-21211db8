'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ServiceRequestForm({ request, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    service_type: 'maintenance',
    priority: 'normal',
    requested_date: '',
    description: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    if (request) {
      setFormData({
        customer_id: request.customer_id || '',
        vehicle_id: request.vehicle_id || '',
        service_type: request.service_type || 'maintenance',
        priority: request.priority || 'normal',
        requested_date: request.requested_date?.split('T')[0] || '',
        description: request.description || '',
        status: request.status || 'pending',
        notes: request.notes || ''
      });
    }
  }, [request]);

  const fetchData = async () => {
    try {
      const [customersRes, vehiclesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles')
      ]);

      const [customersData, vehiclesData] = await Promise.all([
        customersRes.json(),
        vehiclesRes.json()
      ]);

      if (customersData.success) setCustomers(customersData.data || []);
      if (vehiclesData.success) setVehicles(vehiclesData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_id || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = request ? `/api/service-requests/${request.id}` : '/api/service-requests';
      const method = request ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save service request');
      }

      const result = await response.json();

      if (result.success) {
        if (onSubmit) {
          onSubmit(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to save service request');
      }
    } catch (err) {
      console.error('Error saving service request:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_id">Customer *</Label>
          <Select value={formData.customer_id} onValueChange={(value) => handleChange('customer_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicle_id">Vehicle</Label>
          <Select value={formData.vehicle_id} onValueChange={(value) => handleChange('vehicle_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="service_type">Service Type</Label>
          <Select value={formData.service_type} onValueChange={(value) => handleChange('service_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="requested_date">Requested Date</Label>
          <Input
            id="requested_date"
            type="date"
            value={formData.requested_date}
            onChange={(e) => handleChange('requested_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            required
            placeholder="Describe the service needed..."
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {request ? 'Update' : 'Create'} Service Request
        </Button>
      </div>
    </form>
  );
}