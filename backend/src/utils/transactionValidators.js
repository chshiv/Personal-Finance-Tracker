import Category from '../models/category.js';
import User from '../models/user.js';
// utils/transactionValidators.js

//  Check for extra keys
export const checkExtraKeys = (body, allowedKeys) => {
    const requestKeys = Object.keys(body);
    const extraKeys = requestKeys.filter((key) => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
      return `Invalid field(s) provided: ${extraKeys.join(", ")}`;
    }
    return null;
  };
  
  // Check for missing required keys
  export const checkMissingKeys = (body, requiredKeys) => {
    const missingKeys = requiredKeys.filter((key) => body[key] === undefined);
    if (missingKeys.length > 0) {
      return `Missing required field(s): ${missingKeys.join(", ")}`;
    }
    return null;
  };
  
  // Validate amount
  export const validateAmount = (amount, fieldName = "Amount") => {
    if (amount === undefined || amount === null) {
      return `${fieldName} is required`;
    }
    if (typeof amount !== "number" || isNaN(amount)) {
      return `${fieldName} must be a valid number`;
    }
    if (amount <= 0) {
      return `${fieldName} must be greater than 0`;
    }
    return null;
  };
  
  // Validate description
  export const validateDescription = (description) => {
    if (typeof description !== "string" || description.trim() === "") {
      return "Description must be a non-empty string";
    }
    return null;
  };
  
  // Validate type (case-insensitive)
  export const validateType = (type, fieldName = "Type") => {
    // Check if value is missing
    if (type === undefined || type === null || type.toString().trim() === "") {
      return `${fieldName} is required`;
    }
  
    // 2Check if value is a string
    if (typeof type !== "string") {
      return `${fieldName} must be a string`;
    }
  
    // Check allowed values (case-insensitive)
    const lowerType = type.toLowerCase();
    const allowedTypes = ["income", "expense"];
    if (!allowedTypes.includes(lowerType)) {
      return `${fieldName} must be either 'income' or 'expense'`;
    }
  
    return null;
  };
  
  const isValidUUID = (value) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };
  
  // Validate categoryId if provided
  export const validateCategoryId = (categoryId) => {
    if (categoryId && (typeof categoryId !== "string" || categoryId.trim() === "")) {
      return "Category ID must be a non-empty string";
    }
    if (!isValidUUID(categoryId)) {
        return "Category ID must be a valid UUID";
      }
    return null;
  };

export const validateCategoryExists = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    return "Category does not exist";
  }
  return null;
};
  
  //Validate userId if provided (admin only)
  export const validateUserId = (userId, id, role) => {
    if (userId) {
        if (typeof userId !== "string" || userId.trim() === "") {
            return "userId must be a non-empty string";
        }

        if (role === "user" && userId === id )
            return null;

        if (role !== "admin") {
          return "Only admin can assign transaction to another user";
        }
    }
    return null;
  };

export const validateUserExists = async (userId, role) => {
  if (role !== "admin") return null; // only admin can assign

  const user = await User.findByPk(userId);
  if (!user) {
    return "Assigned user does not exist";
  }
  return null;
};
