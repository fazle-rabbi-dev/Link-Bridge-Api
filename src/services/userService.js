import User from "../database/User.js";
import bcrypt from "bcryptjs";
import CustomError from "../utils/CustomError.js";
import { validateDocumentId, isValidUsername, validateEmail } from "../utils/helpers.js";
import { validationResult } from "express-validator";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ==========================================================================================
// Create User Account
// ==========================================================================================
const registerUser = async req => {
  const { name, username, email, password } = req.body;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new CustomError(
        400,
        "Oops! The following fields are required in the request body: name (4 characters), username (3 characters), email, password (at least 6 characters long)."
      );
    }

    if (!isValidUsername(username)) {
      throw new CustomError(400, "Invalid username. Username should contain only letter, number & hypen. e.g: john-doe, john123");
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const userData = {
      name,
      username,
      email,
      password: hash
    };
    const user = await User.registerUser(userData);

    return user;
  } catch (error) {
    throw error;
  }
};

// ==========================================================================================
// Login
// ==========================================================================================
const login = async req => {
  try {
    const { username, email, password } = req.body;
    const fields = [username, email, password];

    const errors = validationResult(req);
    const isUsernameValid = req.body.username && !errors.array().some(error => error.path === "username");
    const isEmailValid = req.body.email && !errors.array().some(error => error.path === "email");
    const isPasswordValid = req.body.password && !errors.array().some(error => error.path === "password");

    if (!isPasswordValid || (!isEmailValid && !isUsernameValid)) {
      throw new CustomError(400, "Please provide a valid email or username (at least 3 characters) and a password (at least 6 characters).");
    }

    const user = await User.login(req.body);
    return user;
  } catch (error) {
    throw error;
  }
};

// =====================================================================================================================
// Login With (Github/Google)
// =====================================================================================================================
const loginWithSocial = async req => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new CustomError(400, "All fields are required: name, email, username, password, authMethod");
    }

    const user = await User.loginWithSocial(req.body);
    return user;
  } catch (error) {
    throw error;
  }
};

// ==========================================================================================
// Confirm Account
// ==========================================================================================
const confirmAccount = async query => {
  const { userId, token } = query;

  try {
    const isValidId = validateDocumentId(userId);

    if (!userId || !token || !isValidId) {
      throw new CustomError(400, "Please provide valid userId and token as query parameter in the URL.");
    }

    const status = await User.confirmAccount(userId, token);
    return status;
  } catch (error) {
    throw error;
  }
};

// ==========================================================================================
// Reset Password
// ==========================================================================================
const resetPassword = async req => {
  const { email, newPassword, token, userId } = req.body;
  const { type } = req.query;

  if (!["reset", "change", "validateLink"].includes(type)) {
    throw new CustomError(400, "The request cannot be processed due to a missing or invalid 'type' query parameter.");
  }

  if (type === "reset" && !validateEmail(email)) {
    throw new CustomError(400, "Invalid email. Check your request body and make sure email is present.");
  }

  if (type === "change" && newPassword?.trim().length < 6) {
    throw new CustomError(400, "Password must be at least 6 digits.");
  }

  if (type === "change" && (!token?.trim() || !userId)) {
    throw new CustomError(400, "You don't have permission to change the password due to missing or invalid: token or userId.");
  }

  if (type === "change" || type === "validateLink") {
    if (!validateDocumentId(userId)) {
      throw new CustomError(400, "Invalid Userid.");
    }
  }

  const res = await User.resetPassword({ email, userId, newPassword, token, type });
  return res;
};

// ==========================================================================================
// Change Password
// ==========================================================================================
const changePassword = async req => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword?.trim() || !newPassword?.trim()) {
      throw new CustomError(400, "Both old password and new password are required. Please provide values for both fields in request body.");
    }

    if (oldPassword.length < 6 || newPassword.length < 6) {
      throw new CustomError(400, "Password must be at least 6 digit.");
    }

    await User.changePassword(oldPassword, newPassword, req);
  } catch (error) {
    throw error;
  }
};

// ==========================================================================================
// Find User By Id
// ==========================================================================================
const getUserById = async req => {
  const { userId } = req.params;
  const isOwner = req?.user?._id === userId;

  try {
    if (!validateDocumentId(userId)) {
      throw new CustomError(400, "Missing or invalid userid. Please check the userid in the URL parameter.");
    }

    if (!isOwner) {
      throw new CustomError(401, "Unauthorized access: You are not the owner and do not have permission to access this resource.");
    }

    const user = await User.getUserById(userId);
    return user;
  } catch (error) {
    throw error;
  }
};

// ==========================================================================================
// Get Linktree Profile
// ==========================================================================================
const getLinktreeProfile = async req => {
  const { username } = req.params;

  if (!username) {
    throw new CustomError(400, "Username missing in request parameter.");
  }

  const user = await User.getLinktreeProfile(username);

  if (!user) {
    throw new CustomError(400, "User does not exists.");
  }

  return user;
};

// ==========================================================================================
// Update Account
// ==========================================================================================
const updateAccount = async req => {
  const { name, bio, username, oldPassword, newPassword, profilePicPublicId, removeProfilePic, title, description } = req.body;
  const { userId } = req.params;
  const { updateType } = req.query;
  const avatar = req.file?.path;

  const supported_types = ["profile", "seo", "username", "changePassword"];
  let newDataToUpdate = {
    name,
    bio
  };

  if (userId !== req.user?._id) {
    throw new CustomError(
      401,
      "Oops! It seems you don't have permission to complete this action. Please ensure that the 'userId' is included in the request parameter."
    );
  }

  // =====================================================================================================================
  // Validation
  // =====================================================================================================================
  if (!supported_types.includes(updateType)) {
    throw new CustomError(400, "Invalid update type. Valid types are: profile, seo, username, changePassword");
  }

  if (updateType === "profile" && (!name?.trim() || !bio?.trim())) {
    throw new CustomError(400, "Required name & bio to update profile.");
  }

  // Prepare Seo Metadata to Update
  if (updateType === "seo" && (!title?.trim() || !description?.trim())) {
    throw new CustomError(400, "Required title & description to update SEO metadata.");
  }

  if (updateType === "seo") {
    newDataToUpdate = {
      seoMetadata: {
        title,
        desc: description
      }
    };
  }

  // Prepare Usetname to Update
  if (updateType === "username" && !isValidUsername(username)) {
    throw new CustomError(400, "Invalid username is required.");
  }

  if (updateType === "username") {
    newDataToUpdate = {
      username
    };
  }

  // Prepare Password to Update
  const isValidPassword = oldPassword?.trim().length >= 6 || newPassword?.trim().length >= 6;
  if (updateType === "changePassword" && !isValidPassword) {
    throw new CustomError(400, "Password must be at least 6 digits.");
  }

  if (updateType === "changePassword") {
    newDataToUpdate = {
      oldPassword,
      newPassword
    };
  }

  // =====================================================================================================================
  // Handle Profile Pic Change
  // =====================================================================================================================
  // If new profile pic uploaded then delete old profile pic from cloudinary & upload new one!
  let profilePicUrl = "";
  let profilePicId = "";

  if (updateType === "profile" && avatar) {
    const res = await uploadOnCloudinary(avatar);
    profilePicUrl = res?.secure_url || "";
    profilePicId = res?.public_id || "";
  }

  if (profilePicUrl && profilePicId) {
    newDataToUpdate.profilePic = {
      url: profilePicUrl,
      publicId: profilePicId
    };
  }

  if (updateType === "profile" && removeProfilePic.toLowerCase() === "yes") {
    newDataToUpdate.removeProfilePic = true;
  }

  const user = await User.updateAccount(req, newDataToUpdate);
  return user;
};

// =====================================================================================================================
// Update Linktree Profile Design
// =====================================================================================================================
const updateLinktreeProfileDesign = async req => {
  const { data } = req.body;
  const { type } = req.query;

  const supported_types = ["theme", "background", "buttonStyle", "fontStyle", "socialPosition"];

  if (!supported_types.includes(type)) {
    throw new CustomError(
      400,
      "Required 'type' query parameter and value should be the following: (theme, background, buttonStyle, fontStyle, socialPosition)."
    );
  }

  if (!data) {
    throw new CustomError(400, "Missing data in request body.");
  }

  if (type === "theme" && !data?.theme.trim()) {
    throw new CustomError(400, "Theme field is required in the request data object.");
  }

  // =====================================================================================================================
  // Handle Custom Background Image Uploading
  // =====================================================================================================================
  const bgImage = req.file?.path;
  const isValidBackground = !!(data?.background?.color.trim() || bgImage);

  if (type === "background" && !data?.background) {
    throw new CustomError(400, "Background field is required in the data object.");
  }

  if (type === "background" && !isValidBackground) {
    throw new CustomError(400, "Background is not valid.");
  }

  let uploadedImgUrl = "";
  let uploadedImgId = "";
  if (type === "background" && bgImage && !data?.background?.color.trim()) {
    const uploadedFile = await uploadOnCloudinary(bgImage);
    uploadedImgUrl = uploadedFile?.secure_url;
    uploadedImgId = uploadedFile?.public_id;
  }

  if (type === "buttonStyle" && !data?.buttonStyle) {
    throw new CustomError(400, "buttonStyle field is required in the request data object.");
  }

  if (type === "fontStyle" && !data?.fontStyle) {
    throw new CustomError(400, "fontStyle field is required in the data object.");
  }

  if (type === "socialPosition" && !["top", "bottom"].includes(data?.socialPosition.toLowerCase())) {
    throw new CustomError(400, "socialPosition field is required in the data object & value must be: (top/bottom).");
  }

  const design = {
    ...data
  };

  if (uploadedImgUrl) {
    design.background.image.url = uploadedImgUrl;
    design.background.image.publicId = uploadedImgId;
  }
  
  const updatedDoc = await User.updateLinktreeProfileDesign(req.user._id, design, type);
  return updatedDoc;
};

export default {
  registerUser,
  login,
  loginWithSocial,
  confirmAccount,
  resetPassword,
  changePassword,
  getUserById,
  getLinktreeProfile,
  updateAccount,
  updateLinktreeProfileDesign
};
