// Field validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateField = (field: string, value: string): string => {
  let error = '';

  switch (field) {
    case 'fullName':
      if (!value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Full name must be at least 2 characters';
      break;
    case 'email':
      if (!value.trim()) error = 'Email is required';
      else if (!validateEmail(value)) error = 'Please enter a valid email address';
      break;
    case 'mobileNumber':
      if (!value.trim()) error = 'Mobile number is required';
      else if (!validatePhone(value)) error = 'Please enter a valid phone number';
      break;
    case 'firstName':
      if (!value.trim()) error = 'First name is required';
      break;
    case 'lastName':
      if (!value.trim()) error = 'Last name is required';
      break;
    case 'address':
      if (!value.trim()) error = 'Address is required';
      break;
    case 'location':
      if (!value.trim()) error = 'Location is required';
      break;
    case 'password':
      if (!value.trim()) error = 'Password is required';
      else if (value.length < 8) error = 'Password must be at least 8 characters';
      break;
    case 'confirmPassword':
      if (!value.trim()) error = 'Please confirm your password';
      break;
    case 'currentPassword':
      if (!value.trim()) error = 'Current password is required';
      break;
    case 'newPassword':
      if (!value.trim()) error = 'New password is required';
      else if (value.length < 8) error = 'New password must be at least 8 characters';
      break;
    case 'bio':
      if (value.trim().length > 500) error = 'Bio must be less than 500 characters';
      break;
    case 'specialization':
      if (!value.trim()) error = 'Specialization is required';
      break;
    case 'licenseNumber':
      if (!value.trim()) error = 'License number is required';
      break;
    case 'experience':
      if (!value.trim()) error = 'Years of experience is required';
      else if (isNaN(Number(value)) || Number(value) < 0) error = 'Please enter a valid number of years';
      break;
    default:
      // For unknown fields, just check if it's required
      if (!value.trim()) error = `${field} is required`;
  }

  return error;
};

// Validation types for TypeScript
export type ValidationField = 
  | 'fullName'
  | 'email'
  | 'mobileNumber'
  | 'firstName'
  | 'lastName'
  | 'address'
  | 'location'
  | 'password'
  | 'confirmPassword'
  | 'currentPassword'
  | 'newPassword'
  | 'bio'
  | 'specialization'
  | 'licenseNumber'
  | 'experience';

// Helper function to validate multiple fields at once
export const validateFields = (fields: Record<string, string>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(fields).forEach(([field, value]) => {
    const error = validateField(field, value);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Helper function to check if all required fields are valid
export const isFormValid = (fields: Record<string, string>, requiredFields: string[]): boolean => {
  const errors = validateFields(fields);
  return requiredFields.every(field => !errors[field]);
};
