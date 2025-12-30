'use client';

import { useState } from 'react';

interface Payment {
  id: number;
  payment_method: string;
  amount: number;
  status: string;
  date: string;
  customer_name: string;
}

export default function PaymentTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No payments found</td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}