'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  total_sales: number;
  total_revenue: number;
  top_salesperson: string;
  monthly_trend: Array<{ month: string; sales: number; revenue: number }>;
}

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/reports/sales');
        if (!response.ok) throw new Error('Failed to fetch sales data');
        const data = await response.json();
        setSalesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading sales report...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (!salesData) {
    return <div className="p-6 text-center">No sales data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{salesData.total_sales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">${salesData.total_revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Top Salesperson</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{salesData.top_salesperson}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.monthly_trend.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sales}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}