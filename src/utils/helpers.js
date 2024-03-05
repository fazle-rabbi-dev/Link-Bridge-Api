import mongoose from "mongoose";
import crypto from "crypto";
import { ACCOUNT_CONFIRMATION_ROUTE, RESET_PASSWORD_ROUTE } from "./constants.js";

// Validate user inputed id against Mongoose ObjectId
export function validateDocumentId(inputId) {
  if (!inputId || !inputId.trim()) return false;

  try {
    const mongooseObjectId = new mongoose.Types.ObjectId(inputId);
    return true;
  } catch (error) {
    return false;
  }
}

// Username validator
export function isValidUsername(username) {
  var regex = /^[a-z](?!.*--)(?!.*-$)[a-z0-9-]*[a-z0-9]$/;
  return regex.test(username.toLowerCase());
}

// Random string
export const generateRandomString = (length = 128) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString("base64");
        resolve(token);
      }
    });
  });
};

export const generateAccountConfirmationLink = (userId, confirmationToken) => {
  return `${ACCOUNT_CONFIRMATION_ROUTE}?userId=${userId}&token=${confirmationToken}`;
};

export const generateResetPasswordLink = (userId, resetPasswordToken) => {
  return `${RESET_PASSWORD_ROUTE}?userId=${userId}&token=${resetPasswordToken}`;
};

export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

// Function to generate a token
export function generateToken(length = 60) {
  const randomBytes = crypto.randomBytes(length);
  const token = randomBytes.toString("hex");

  return token;
}
