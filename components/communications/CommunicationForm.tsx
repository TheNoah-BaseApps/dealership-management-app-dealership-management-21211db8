'use client';

import { useState } from 'react';

interface CommunicationFormData {
  customerId: string;
  channel: string;
  type: string;
  subject: string;
  message: string;
  priority: string;
  assignedTo: string;
}

interface CommunicationFormProps {
  initialData?: Partial<CommunicationFormData>;
  onSubmit: (data: CommunicationFormData) => void;
  onCancel: () => void;
}

export default function CommunicationForm({ initialData, onSubmit, onCancel }: CommunicationFormProps) {
  const [formData, setFormData] = useState<CommunicationFormData>({
    customerId: initialData?.customerId || '',
    channel: initialData?.channel || 'email',
    type: initialData?.type || 'inquiry',
    subject: initialData?.subject || '',
    message: initialData?.message || '',
    priority: initialData?.priority || 'medium',
    assignedTo: initialData?.assignedTo || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
          Customer ID
        </label>
        <input
          type="text"
          id="customerId"
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
            Channel
          </label>
          <select
            id="channel"
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
            <option value="chat">Chat</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="inquiry">Inquiry</option>
            <option value="complaint">Complaint</option>
            <option value="feedback">Feedback</option>
            <option value="follow-up">Follow-up</option>
            <option value="service">Service Request</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
            Assigned To
          </label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Communication
        </button>
      </div>
    </form>
  );
}