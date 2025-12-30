'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';

export default function RepairOrderForm({ order, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    technician_id: '',
    order_number: '',
    status: 'pending',
    priority: 'normal',
    mileage: '',
    complaint: '',
    diagnosis: '',
    estimated_completion: '',
    parts: [],
    labor_items: [],
    notes: ''
  });

  const [laborItem, setLaborItem] = useState({
    description: '',
    hours: '',
    rate: '75'
  });

  const [partItem, setPartItem] = useState({
    part_number: '',
    description: '',
    quantity: '',
    unit_price: ''
  });

  useEffect(() => {
    fetchData();
    if (order) {
      setFormData({
        customer_id: order.customer_id || '',
        vehicle_id: order.vehicle_id || '',
        technician_id: order.technician_id || '',
        order_number: order.order_number || '',
        status: order.status || 'pending',
        priority: order.priority || 'normal',
        mileage: order.mileage || '',
        complaint: order.complaint || '',
        diagnosis: order.diagnosis || '',
        estimated_completion: order.estimated_completion?.split('T')[0] || '',
        parts: order.parts || [],
        labor_items: order.labor_items || [],
        notes: order.notes || ''
      });
    } else {
      generateOrderNumber();
    }
  }, [order]);

  const fetchData = async () => {
    try {
      const [customersRes, vehiclesRes, usersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
        fetch('/api/users?role=technician')
      ]);

      const [customersData, vehiclesData, usersData] = await Promise.all([
        customersRes.json(),
        vehiclesRes.json(),
        usersRes.json()
      ]);

      if (customersData.success) setCustomers(customersData.data || []);
      if (vehiclesData.success) setVehicles(vehiclesData.data || []);
      if (usersData.success) setTechnicians(usersData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const generateOrderNumber = () => {
    const prefix = 'RO';
    const timestamp = Date.now().toString().slice(-8);
    setFormData(prev => ({ ...prev, order_number: `${prefix}-${timestamp}` }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLaborItem = () => {
    if (!laborItem.description || !laborItem.hours || !laborItem.rate) {
      alert('Please fill in all labor item fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      description: laborItem.description,
      hours: parseFloat(laborItem.hours),
      rate: parseFloat(laborItem.rate),
      total: parseFloat(laborItem.hours) * parseFloat(laborItem.rate)
    };

    setFormData(prev => ({
      ...prev,
      labor_items: [...prev.labor_items, item]
    }));

    setLaborItem({ description: '', hours: '', rate: '75' });
  };

  const removeLaborItem = (id) => {
    setFormData(prev => ({
      ...prev,
      labor_items: prev.labor_items.filter(item => item.id !== id)
    }));
  };

  const addPart = () => {
    if (!partItem.description || !partItem.quantity || !partItem.unit_price) {
      alert('Please fill in all part fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      part_number: partItem.part_number,
      description: partItem.description,
      quantity: parseInt(partItem.quantity),
      unit_price: parseFloat(partItem.unit_price),
      total: parseInt(partItem.quantity) * parseFloat(partItem.unit_price)
    };

    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, item]
    }));

    setPartItem({ part_number: '', description: '', quantity: '', unit_price: '' });
  };

  const removePart = (id) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter(item => item.id !== id)
    }));
  };

  const calculateTotal = () => {
    const laborTotal = formData.labor_items.reduce((sum, item) => sum + (item.total || 0), 0);
    const partsTotal = formData.parts.reduce((sum, item) => sum + (item.total || 0), 0);
    return laborTotal + partsTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_id || !formData.vehicle_id || !formData.complaint) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = order ? `/api/repair-orders/${order.id}` : '/api/repair-orders';
      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_amount: calculateTotal()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save repair order');
      }

      const result = await response.json();

      if (result.success) {
        if (onSubmit) {
          onSubmit(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to save repair order');
      }
    } catch (err) {
      console.error('Error saving repair order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter repair order details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_number">Order Number *</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => handleChange('order_number', e.target.value)}
                required
                readOnly
              />
            </div>

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
              <Label htmlFor="vehicle_id">Vehicle *</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => handleChange('vehicle_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="technician_id">Assigned Technician</Label>
              <Select value={formData.technician_id} onValueChange={(value) => handleChange('technician_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.full_name || tech.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <Label htmlFor="mileage">Current Mileage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleChange('mileage', e.target.value)}
                placeholder="Enter mileage"
              />
            </div>

            <div>
              <Label htmlFor="estimated_completion">Estimated Completion</Label>
              <Input
                id="estimated_completion"
                type="date"
                value={formData.estimated_completion}
                onChange={(e) => handleChange('estimated_completion', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="complaint">Customer Complaint *</Label>
            <Textarea
              id="complaint"
              value={formData.complaint}
              onChange={(e) => handleChange('complaint', e.target.value)}
              placeholder="Describe the customer's complaint or concern..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="Enter diagnostic findings..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Labor Items</CardTitle>
          <CardDescription>Add labor charges for this repair order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={laborItem.description}
                onChange={(e) => setLaborItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Labor description"
              />
            </div>
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.5"
                value={laborItem.hours}
                onChange={(e) => setLaborItem(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label>Rate ($/hr)</Label>
              <Input
                type="number"
                step="0.01"
                value={laborItem.rate}
                onChange={(e) => setLaborItem(prev => ({ ...prev, rate: e.target.value }))}
                placeholder="75.00"
              />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={addLaborItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Labor Item
          </Button>

          {formData.labor_items.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              {formData.labor_items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.hours} hrs × ${item.rate}/hr
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${item.total.toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLaborItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parts</CardTitle>
          <CardDescription>Add parts used in this repair</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Part Number</Label>
              <Input
                value={partItem.part_number}
                onChange={(e) => setPartItem(prev => ({ ...prev, part_number: e.target.value }))}
                placeholder="Part #"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={partItem.description}
                onChange={(e) => setPartItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Part description"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={partItem.quantity}
                onChange={(e) => setPartItem(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={partItem.unit_price}
                onChange={(e) => setPartItem(prev => ({ ...prev, unit_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={addPart}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>

          {formData.parts.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              {formData.parts.map(part => (
                <div key={part.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{part.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Part #: {part.part_number} | Qty: {part.quantity} × ${part.unit_price}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${part.total.toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePart(part.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${calculateTotal().toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {order ? 'Update' : 'Create'} Repair Order
        </Button>
      </div>
    </form>
  );
}