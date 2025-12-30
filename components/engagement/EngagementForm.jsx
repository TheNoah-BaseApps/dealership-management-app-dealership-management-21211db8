'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function EngagementForm({ engagement, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'email',
    title: '',
    description: '',
    engagement_date: new Date().toISOString().split('T')[0],
    status: 'completed',
    outcome: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
    if (engagement) {
      setFormData({
        customer_id: engagement.customer_id || '',
        type: engagement.type || 'email',
        title: engagement.title || '',
        description: engagement.description || '',
        engagement_date: engagement.engagement_date?.split('T')[0] || '',
        status: engagement.status || 'completed',
        outcome: engagement.outcome || '',
        duration: engagement.duration || '',
        notes: engagement.notes || ''
      });
    }
  }, [engagement]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_id || !formData.title) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = engagement ? `/api/engagements/${engagement.id}` : '/api/engagements';
      const method = engagement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save engagement');
      }

      const result = await response.json();

      if (result.success) {
        if (onSubmit) {
          onSubmit(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to save engagement');
      }
    } catch (err) {
      console.error('Error saving engagement:', err);
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
          <Label htmlFor="type">Engagement Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            placeholder="Brief title for this engagement"
          />
        </div>

        <div>
          <Label htmlFor="engagement_date">Date</Label>
          <Input
            id="engagement_date"
            type="date"
            value={formData.engagement_date}
            onChange={(e) => handleChange('engagement_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <Label htmlFor="outcome">Outcome</Label>
          <Input
            id="outcome"
            value={formData.outcome}
            onChange={(e) => handleChange('outcome', e.target.value)}
            placeholder="e.g., Follow-up scheduled, Sale closed"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Describe the engagement..."
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
          {engagement ? 'Update' : 'Create'} Engagement
        </Button>
      </div>
    </form>
  );
}