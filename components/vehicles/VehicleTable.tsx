'use client';

import { useState } from 'react';

interface Vehicle {
  id: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
}

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No vehicles found</td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.vin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vehicle.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}