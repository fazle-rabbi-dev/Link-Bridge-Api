import userService from "../services/userService.js";
import asyncHanlder from "express-async-handler";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// =====================================================================================================================
// Authentication
// =====================================================================================================================
export const registerUser = asyncHanlder(async (req, res) => {
  const user = await userService.registerUser(req);
  res.status(201).json(new ApiResponse("Success", user, "Account created successfully"));
});

export const login = asyncHanlder(async (req, res) => {
  const user = await userService.login(req);
  res.status(200).json(new ApiResponse("Success", user, "Logged in successfully"));
});

export const loginWithSocial = asyncHanlder(async (req, res) => {
  const user = await userService.loginWithSocial(req);
  res.status(200).json(new ApiResponse("Success", user, "Logged in successfully"));
});

export const confirmAccount = asyncHanlder(async (req, res) => {
  await userService.confirmAccount(req.query);
  res.status(200).json(new ApiResponse("Success", null, "Account confirmed successfully."));
});

export const resetPassword = asyncHanlder(async (req, res) => {
  const response = await userService.resetPassword(req);
  
  res.status(200).json(new ApiResponse(
    "Success", 
    response, 
    req?.query.type === "reset" ? "Password reset link sent successfully." : req?.query.type === "validateLink" ? "UserId & token is valid." : "Password changed successfully."
  ));
});

export const changePassword = asyncHanlder(async (req, res) => {
  await userService.changePassword(req);
  res.status(200).json(new ApiResponse("Success", {}, "Password changed successfully."));
});


// ==========================================================================================
// User Account Management
// ==========================================================================================
export const getUserById = asyncHanlder(async (req, res) => {
  const user = await userService.getUserById(req);
  res.status(200).json(new ApiResponse("Success", user, "User found."));
});

export const getLinktreeProfile = asyncHanlder(async (req, res) => {
  const user = await userService.getLinktreeProfile(req);
  res.status(200).json(new ApiResponse("Success", user, "User found."));
});

export const updateAccount = asyncHanlder(async (req, res) => {
  const user = await userService.updateAccount(req);
  res.status(200).json(new ApiResponse("Success", user, "Account updated successfully."));
});

export const updateLinktreeProfileDesign = asyncHanlder(async (req, res) => {
  const user = await userService.updateLinktreeProfileDesign(req);
  res.status(200).json(new ApiResponse("Success", user, "Design updated successfully."));
});
