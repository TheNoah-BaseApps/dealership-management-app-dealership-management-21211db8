'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Wrench, BarChart3, Shield, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Track leads, manage customer profiles, and enhance engagement'
    },
    {
      icon: Car,
      title: 'Inventory Management',
      description: 'Manage vehicles, parts, and accessories with real-time tracking'
    },
    {
      icon: Wrench,
      title: 'Service Scheduling',
      description: 'Schedule appointments, manage repair orders, and track service history'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into sales, service, and inventory performance'
    },
    {
      icon: Shield,
      title: 'Compliance Tracking',
      description: 'Maintain audit trails and ensure regulatory compliance'
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Multi-channel customer interactions and engagement tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Dealership Management System
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            AI-powered platform for managing leads, customers, sales, inventory, service, and compliance
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Join thousands of dealerships using our platform to optimize operations and enhance customer experience
          </p>
          <Button size="lg" onClick={() => router.push('/register')}>
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}