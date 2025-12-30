'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  Printer,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

export default function InvoiceGenerator({ orderId, orderType, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    order_id: orderId || '',
    order_type: orderType || 'repair',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending',
    items: [],
    subtotal: 0,
    tax_rate: 8.5,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    notes: '',
    terms: 'Payment due within 30 days'
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit_price: 0
  });

  useEffect(() => {
    generateInvoiceNumber();
    fetchData();
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax_rate, formData.discount_amount]);

  const fetchData = async () => {
    try {
      const [customersRes, ordersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/repair-orders')
      ]);

      const [customersData, ordersData] = await Promise.all([
        customersRes.json(),
        ordersRes.json()
      ]);

      if (customersData.success) setCustomers(customersData.data || []);
      if (ordersData.success) setOrders(ordersData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const endpoint = orderType === 'sales' ? '/api/sales-orders' : '/api/repair-orders';
      const response = await fetch(`${endpoint}/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const order = result.data;
        
        const items = [];
        
        // Add labor items
        if (order.labor_items) {
          order.labor_items.forEach(labor => {
            items.push({
              id: `labor-${labor.id}`,
              description: labor.description,
              quantity: labor.hours,
              unit_price: labor.rate,
              total: labor.total
            });
          });
        }

        // Add parts
        if (order.parts) {
          order.parts.forEach(part => {
            items.push({
              id: `part-${part.id}`,
              description: part.description,
              quantity: part.quantity,
              unit_price: part.unit_price,
              total: part.total
            });
          });
        }

        setFormData(prev => ({
          ...prev,
          customer_id: order.customer_id,
          items
        }));
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-8);
    setFormData(prev => ({ ...prev, invoice_number: `${prefix}-${timestamp}` }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      alert('Please fill in all item fields with valid values');
      return;
    }

    const item = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity: parseFloat(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total: parseFloat(newItem.quantity) * parseFloat(newItem.unit_price)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({ description: '', quantity: 1, unit_price: 0 });
  };

  const removeItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * formData.tax_rate) / 100;
    const total = subtotal + taxAmount - (formData.discount_amount || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: Math.max(0, total)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_id || formData.items.length === 0) {
      setError('Please select a customer and add at least one item');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const result = await response.json();

      if (result.success) {
        if (onGenerate) {
          onGenerate(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // This would integrate with a PDF generation library
    alert('PDF download functionality would be implemented here');
  };

  const handleSendEmail = async () => {
    alert('Email sending functionality would be implemented here');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <CardTitle>Invoice Information</CardTitle>
          <CardDescription>Generate a new invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => handleChange('invoice_number', e.target.value)}
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
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => handleChange('invoice_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </div>

            {!orderId && (
              <div>
                <Label htmlFor="order_id">Related Order (Optional)</Label>
                <Select value={formData.order_id} onValueChange={(value) => handleChange('order_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Add items to this invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.unit_price}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {formData.items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right p-3 font-semibold">${item.total.toFixed(2)}</td>
                      <td className="p-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="discount_amount">Discount Amount ($)</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => handleChange('discount_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({formData.tax_rate}%):</span>
              <span className="font-semibold">${formData.tax_amount.toFixed(2)}</span>
            </div>
            {formData.discount_amount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span className="font-semibold">-${formData.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-600">${formData.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="terms">Payment Terms</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => handleChange('terms', e.target.value)}
              placeholder="Enter payment terms..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-between">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button type="button" variant="outline" onClick={handleSendEmail}>
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Invoice
        </Button>
      </div>
    </form>
  );
}