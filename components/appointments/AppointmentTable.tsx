'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Appointment {
  id: number;
  customer_name: string;
  vehicle_info: string;
  service_type: string;
  appointment_date: string;
  status: string;
}

interface AppointmentTableProps {
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
}

export default function AppointmentTable({ onEdit, onView }: AppointmentTableProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/appointments');
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="p-4">Loading appointments...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No appointments found
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.id}</TableCell>
                <TableCell>{appointment.customer_name}</TableCell>
                <TableCell>{appointment.vehicle_info}</TableCell>
                <TableCell>{appointment.service_type}</TableCell>
                <TableCell>{new Date(appointment.appointment_date).toLocaleString()}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onView && (
                      <Button variant="outline" size="sm" onClick={() => onView(appointment)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}