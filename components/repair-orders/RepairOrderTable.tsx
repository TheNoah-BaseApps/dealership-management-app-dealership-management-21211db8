'use client';

import { useState } from 'react';

interface RepairOrder {
  id: number;
  order_number: string;
  customer_name: string;
  vehicle: string;
  status: string;
  total_cost: number;
  created_at: string;
}

export default function RepairOrderTable() {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No repair orders found</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.order_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.vehicle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total_cost.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}