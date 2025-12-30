'use client';

import { useState } from 'react';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  date: string;
}

export default function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No invoices found</td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoice_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}