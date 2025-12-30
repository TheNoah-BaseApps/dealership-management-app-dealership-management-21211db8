export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhone(phone) {
  const regex = /^\+?[\d\s-()]+$/;
  return regex.test(phone);
}

export function validateVIN(vin) {
  const regex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return regex.test(vin);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRole(role) {
  const validRoles = ['admin', 'manager', 'sales', 'service', 'inventory', 'accountant'];
  return validRoles.includes(role);
}

export function validatePriorityLevel(priority) {
  const validPriorities = ['High', 'Medium', 'Low'];
  return validPriorities.includes(priority);
}

export function validateResolutionStatus(status) {
  const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  return validStatuses.includes(status);
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

export function validatePaymentMethod(method) {
  const validMethods = ['Cash', 'Card', 'Finance'];
  return validMethods.includes(method);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateNumber(value, fieldName, min = null, max = null) {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (min !== null && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (max !== null && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
}