'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  AlertCircle, 
  Search, 
  SlidersHorizontal,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Gauge,
  Fuel,
  Calendar
} from 'lucide-react';

export default function InventoryGrid({ onEdit, onDelete, onView }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/vehicles?include=all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const result = await response.json();
      
      if (result.success) {
        setVehicles(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load vehicles');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete vehicle');
        }

        setVehicles(vehicles.filter(v => v.id !== id));
        
        if (onDelete) {
          onDelete(id);
        }
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Failed to delete vehicle: ' + err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Available', variant: 'default', color: 'bg-green-500' },
      sold: { label: 'Sold', variant: 'secondary', color: 'bg-blue-500' },
      reserved: { label: 'Reserved', variant: 'outline', color: 'bg-yellow-500' },
      maintenance: { label: 'Maintenance', variant: 'destructive', color: 'bg-red-500' }
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.stock_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesType = filterType === 'all' || vehicle.vehicle_type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, VIN, or stock number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No vehicles found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first vehicle to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Vehicle Image */}
                <div className="relative h-48 bg-muted flex items-center justify-center">
                  {vehicle.image_url ? (
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="h-16 w-16 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Vehicle Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.trim || 'Base Model'}
                      </p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.mileage?.toLocaleString() || 0} mi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{vehicle.fuel_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{vehicle.transmission || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 capitalize">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{vehicle.vehicle_type || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {vehicle.price?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {vehicle.stock_number}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onView(vehicle)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onEdit(vehicle)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}