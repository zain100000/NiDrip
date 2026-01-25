/**
 * @file Validation.utility.js
 * @module Utilities/Validation
 * @description
 * A comprehensive suite of validation logic for form handling and data integrity.
 * Includes individual field validators, regex-based security checks, and
 * bulk validation processing for entire form objects.
 */

/**
 * Validate full name.
 * @param {string} fullName - The user's full name.
 * @returns {string} Error message or empty string if valid.
 */
export const validateFullName = (fullName) => {
  if (!fullName) {
    return "Full Name is required";
  }
  if (fullName.length < 3) {
    return "Full Name must be at least 3 characters long";
  }
  return "";
};

/**
 * Validate email format.
 * @param {string} email - The user's email address.
 * @returns {string} Error message or empty string if valid.
 */
export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Validate password strength.
 * Requirements:
 * - At least 8 characters long
 * - 1 Uppercase letter
 * - 1 Lowercase letter
 * - 1 Special character
 * - 1 Number
 *
 * @param {string} password - The user's password.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  return "";
};

/**
 * @file Validation.utility.js
 */

export const validateTitle = (title) => {
  if (!title) return "Title is required";
  if (title.length < 5) return "Title must be at least 5 characters long";
  return "";
};

export const validateDescription = (description) => {
  if (!description) return "Description is required";
  if (description.length < 20) return "Description is too short";
  return "";
};

export const validatePrice = (price) => {
  if (!price || isNaN(price) || parseFloat(price) <= 0)
    return "Valid price is required";
  return "";
};

export const validateStock = (stock) => {
  if (stock === "" || isNaN(stock) || parseInt(stock) < 0)
    return "Valid stock quantity is required";
  return "";
};

export const validateCategory = (category) => {
  if (!category || (Array.isArray(category) && category.length === 0))
    return "At least one category is required";
  return "";
};

export const validateSpecifications = (specs) => {
  if (!specs || !Array.isArray(specs) || specs.length === 0)
    return "Specifications are required";
  const hasItems = specs.some(
    (section) => section.items && section.items.length > 0,
  );
  if (!hasItems) return "At least one specification item is required";
  return "";
};

/**
 * Validate multiple fields at once using the appropriate validation function.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {Object} Errors keyed by field name.
 */
export const validateFields = (fields) => {
  const validationFunctions = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
    title: validateTitle,
    description: validateDescription,
    price: validatePrice,
    stock: validateStock,
    category: validateCategory,
    specifications: validateSpecifications,
  };

  const errors = {};

  Object.keys(fields).forEach((field) => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Determine if all inputs in a form are valid.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
export const isValidInput = (fields) => {
  console.log("Validating fields: ", fields);
  const errors = validateFields(fields);
  console.log("Validation errors: ", errors);
  return Object.keys(errors).length === 0;
};
