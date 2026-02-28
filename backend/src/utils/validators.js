// utils/validator.js

export const validateFields = (body, allowedKeys) => {
    const requestKeys = Object.keys(body);
  
    // Check for extra keys
    const extraKeys = requestKeys.filter(key => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
      return { error: `Invalid field(s): ${extraKeys.join(", ")}` };
    }
  
    // Check for missing keys
    const missingKeys = allowedKeys.filter(key => !body.hasOwnProperty(key));
    if (missingKeys.length > 0) {
      return { error: `Missing required field(s): ${missingKeys.join(", ")}` };
    }
  
    return { error: null };
  };
  
  
  export const validateStringField = (value, fieldName) => {
    if (value === undefined || value === null) {
      return `${fieldName} is required`;
    }
  
    if (typeof value !== "string") {
      return `${fieldName} must be a string`;
    }
  
    const trimmed = value.trim();
  
    if (trimmed.length === 0) {
      return `${fieldName} cannot be empty`;
    }
  
    return null;
  };