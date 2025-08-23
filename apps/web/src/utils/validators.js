import { VALIDATION_RULES } from "./constants";

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email format";
  return "";
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < VALIDATION_RULES.NAME.MIN) {
    return `Name must be at least ${VALIDATION_RULES.NAME.MIN} characters`;
  }
  if (name.length > VALIDATION_RULES.NAME.MAX) {
    return `Name must not exceed ${VALIDATION_RULES.NAME.MAX} characters`;
  }
  return "";
};

export const validateAddress = (address) => {
  if (!address) return "Address is required";
  if (address.length > VALIDATION_RULES.ADDRESS.MAX) {
    return `Address must not exceed ${VALIDATION_RULES.ADDRESS.MAX} characters`;
  }
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < VALIDATION_RULES.PASSWORD.MIN) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN} characters`;
  }
  if (password.length > VALIDATION_RULES.PASSWORD.MAX) {
    return `Password must not exceed ${VALIDATION_RULES.PASSWORD.MAX} characters`;
  }
  if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return "Password must contain at least one uppercase letter and one special character";
  }
  return "";
};

export const validateRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }
  return "";
};

export const validateRole = (role) => {
  const validRoles = ["admin", "user", "store_owner"];
  if (!role) return "Role is required";
  if (!validRoles.includes(role)) return "Invalid role selected";
  return "";
};
