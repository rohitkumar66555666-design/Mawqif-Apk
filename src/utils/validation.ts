// Form validation utilities

export const validatePlaceTitle = (title: string): string => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.trim().length > 100) {
    return 'Title must be less than 100 characters';
  }
  return '';
};

export const validateCity = (city: string): string => {
  if (!city || city.trim().length === 0) {
    return 'City is required';
  }
  if (city.trim().length < 2) {
    return 'City must be at least 2 characters';
  }
  return '';
};

export const validateCapacity = (capacity: string): string => {
  if (!capacity || capacity.trim() === '') {
    return ''; // Capacity is optional
  }
  const num = parseInt(capacity);
  if (isNaN(num) || num < 1 || num > 10000) {
    return 'Capacity must be a number between 1 and 10000';
  }
  return '';
};

export const validateCoordinates = (lat: number, lng: number): string => {
  if (lat < -90 || lat > 90) {
    return 'Invalid latitude';
  }
  if (lng < -180 || lng > 180) {
    return 'Invalid longitude';
  }
  return '';
};

// Contact information validation
export const validatePhoneNumber = (phone: string): string => {
  if (!phone || phone.trim().length === 0) {
    return 'Phone number is required for visitors to contact you';
  }
  
  // Remove spaces and special characters for validation
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's a valid format (at least 10 digits)
  if (!/^\d{10,15}$/.test(cleanPhone)) {
    return 'Please enter a valid phone number (10-15 digits)';
  }
  
  return '';
};

export const validateWhatsAppNumber = (whatsapp: string): string => {
  if (!whatsapp || whatsapp.trim().length === 0) {
    return 'WhatsApp number is required for easy visitor communication';
  }
  
  // Remove spaces and special characters for validation
  const cleanWhatsApp = whatsapp.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's a valid format (at least 10 digits)
  if (!/^\d{10,15}$/.test(cleanWhatsApp)) {
    return 'Please enter a valid WhatsApp number (10-15 digits)';
  }
  
  return '';
};

// Validate that at least one contact method is provided
export const validateContactInfo = (phone: string, whatsapp: string): string => {
  const phoneValid = validatePhoneNumber(phone) === '';
  const whatsappValid = validateWhatsAppNumber(whatsapp) === '';
  
  if (!phoneValid && !whatsappValid) {
    return 'Please provide at least one valid contact method (phone or WhatsApp)';
  }
  
  return '';
};
