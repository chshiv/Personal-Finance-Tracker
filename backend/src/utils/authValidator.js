import validator from "validator";

export const validateRequiredFields = (body, requiredKeys) => {
    const missing = requiredKeys.filter(
      key => !body[key] || body[key] === ""
    );
  
    if (missing.length > 0) {
      return `All fields are required: ${missing.join(", ")}`;
    }
  
    return null;
  };
  
  
// Name Validation
// Only alphabets + single spaces
export const validateName = (name) => {
if (!name) return "Name is required";

if (typeof name !== "string")
    return "Name must be a string";

const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

if (!nameRegex.test(name.trim())) {
    return "Name must contain only uppercase/lowercase letters and single spaces between words";
}

return null;
};

// Email Validation
export const validateEmail = (email) => {
    if (!email) return "Email is required";
  
    if (typeof email !== "string")
      return "Email must be a string";
  
    const trimmed = email.trim();
  
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    return null;
  };
  
  
// Password Strength Validation (For Register)

export const validateStrongPassword = (password) => {
if (!password) return "Password is required";

if (typeof password !== "string")
    return "Password must be a string";

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters and include uppercase, lowercase, number and special symbol";
}

return null;
};

export const validateRole = (role) => {
    if (!role) return "Role is required";
    if (typeof role !== "string") return "Role must be a string";
    const allowedRoles = ["admin", "user", "read-only"];
    const normalizedRole = role.toLowerCase();
    if (!allowedRoles.includes(normalizedRole)) return "Role must be one of: admin, user, read-only";
    return null;
};

// Basic Password Validation (For Login)
export const validateLoginPassword = (password) => {
if (!password) return "Password is required";

if (typeof password !== "string")
    return "Password must be a string";

return null;
};