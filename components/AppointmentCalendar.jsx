'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  User,
  Car,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function AppointmentCalendar({ onSelectDate, onSelectAppointment }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month'); // month, week, day

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, view]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = getStartDate();
      const endDate = getEndDate();

      const response = await fetch(
        `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();

      if (result.success) {
        setAppointments(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.scheduled;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointment Calendar</CardTitle>
            <CardDescription>{monthName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={view === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'month' ? (
          <div className="space-y-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day.date);
                const today = isToday(day.date);

                return (
                  <div
                    key={index}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                      ${!day.isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : 'hover:bg-muted'}
                      ${today ? 'border-primary border-2' : ''}
                    `}
                    onClick={() => onSelectDate && onSelectDate(day.date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${today ? 'text-primary' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map(apt => (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded truncate ${getStatusColor(apt.status)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment && onSelectAppointment(apt);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(apt.appointment_time)}
                          </div>
                          <div className="truncate font-medium">
                            {apt.customer_name || 'No customer'}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments scheduled</p>
              </div>
            ) : (
              appointments.map(apt => (
                <Card
                  key={apt.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatTime(apt.appointment_time)}
                          </span>
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{apt.customer_name || 'No customer'}</span>
                        </div>
                        {apt.vehicle_info && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Car className="h-4 w-4" />
                            <span>{apt.vehicle_info}</span>
                          </div>
                        )}
                        {apt.service_type && (
                          <div className="text-sm">
                            <span className="font-medium">Service:</span> {apt.service_type}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}