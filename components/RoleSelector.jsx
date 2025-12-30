'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales Representative' },
  { value: 'service', label: 'Service Advisor' },
  { value: 'inventory', label: 'Inventory Manager' },
  { value: 'accountant', label: 'Accountant' },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role *</Label>
      <Select value={value} onValueChange={onChange} required>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-500">
        Select the role that best describes your position
      </p>
    </div>
  );
}