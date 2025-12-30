'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CreditCard, Loader2, DollarSign, CheckCircle } from 'lucide-react';

export default function PaymentModal({ open, onOpenChange, invoice, onPaymentComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_id: '',
    payment_method: 'cash',
    amount: 0,
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoice.id,
        amount: invoice.total_amount - (invoice.paid_amount || 0)
      }));
    }
  }, [invoice]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);
    if (formData.amount > remainingAmount) {
      setError(`Payment amount cannot exceed remaining balance of $${remainingAmount.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        
        // Update invoice status
        await fetch(`/api/invoices/${invoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paid_amount: (invoice.paid_amount || 0) + formData.amount,
            status: formData.amount >= remainingAmount ? 'paid' : 'partial'
          })
        });

        setTimeout(() => {
          if (onPaymentComplete) {
            onPaymentComplete(result.data);
          }
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Processed Successfully!</h3>
            <p className="text-muted-foreground">
              Payment of ${formData.amount.toFixed(2)} has been recorded
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Total:</span>
                <span className="font-semibold">${invoice.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-semibold">${(invoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Remaining Balance:</span>
                <span className="font-bold text-primary">${remainingAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${remainingAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleChange('payment_method', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleChange('payment_date', e.target.value)}
                required
              />
            </div>

            {(formData.payment_method === 'check' || formData.payment_method === 'credit_card' || formData.payment_method === 'bank_transfer') && (
              <div>
                <Label htmlFor="reference_number">
                  {formData.payment_method === 'check' ? 'Check Number' : 
                   formData.payment_method === 'credit_card' ? 'Transaction ID' : 
                   'Reference Number'}
                </Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => handleChange('reference_number', e.target.value)}
                  placeholder={
                    formData.payment_method === 'check' ? 'Enter check number' :
                    formData.payment_method === 'credit_card' ? 'Enter transaction ID' :
                    'Enter reference number'
                  }
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes about this payment..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}