'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import AppointmentTable from '@/components/appointments/AppointmentTable';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/service-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data.data.appointments);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchAppointments();
    toast.success('Appointment scheduled successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Service Appointments</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <AppointmentCalendar appointments={appointments} />
      <AppointmentTable appointments={appointments} onRefresh={fetchAppointments} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Service Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}