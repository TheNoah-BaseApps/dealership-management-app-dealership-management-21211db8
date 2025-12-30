'use client';

import { useState } from 'react';

interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  channel: string;
  type: string;
  subject: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
}

interface CommunicationTableProps {
  communications: Communication[];
  onView: (communication: Communication) => void;
  onEdit: (communication: Communication) => void;
  onDelete: (id: string) => void;
}

export default function CommunicationTable({ communications, onView, onEdit, onDelete }: CommunicationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Channel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {communications.map((comm) => (
            <tr key={comm.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {comm.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {comm.channel}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {comm.type}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {comm.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  comm.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  comm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {comm.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {comm.assignedTo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(comm.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onView(comm)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(comm)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comm.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}