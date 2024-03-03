import UserModel from "../models/UserModel.js";
import LinkModel from "../models/LinkModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import sendEmail from "../utils/sendEmail.js";
import { generateAccountConfirmationEmail, generatePasswordResetEmail } from "../utils/emailTemplates.js";
import { generateToken, generateAccountConfirmationLink, generateResetPasswordLink } from "../utils/helpers.js";
import { PROJECT_NAME } from "../utils/constants.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ==========================================================================================
// Create User Account
// ==========================================================================================
const registerUser = async userData => {
  const { username, email } = userData;

  const existingUser = await UserModel.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    const whichOneExists = existingUser.email === email ? "email" : "username";

    throw {
      status: 400,
      message: `A user already exists with the same ${whichOneExists}.`
    };
  }

  // Create user in db
  const createdUser = await new UserModel(userData).save();

  // Generate confirmation link
  const confirmationToken = await generateToken();
  const confirmationLink = generateAccountConfirmationLink(createdUser._id.toString(), confirmationToken);

  // Store confirmationToken in db
  createdUser.authentication.confirmationToken = confirmationToken;
  await createdUser.save();

  // Send account confirmation email
  const htmlEmailTemplate = generateAccountConfirmationEmail(createdUser.name, confirmationLink);
  await sendEmail(createdUser.email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

  const userObject = createdUser.toObject();
  delete userObject.password;
  delete userObject.authentication;

  return userObject;
};

// ==========================================================================================
// Login
// ==========================================================================================
const login = async ({ username, email, password }) => {
  const user = await UserModel.findOne({
    $or: [{ username }, { email }]
  }).select("+password +authentication.isConfirmed");

  if (!user || user.authentication.authMethod !== "email+password") {
    throw new CustomError(404, "User does not exist.");
  }

  if (!user.authentication.isConfirmed) {
    throw new CustomError(403, "Account Not Confirmed. Your account needs to be confirmed. Please check your email inbox for the confirmation link.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new CustomError(401, "Invalid user credentials.");
  }

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const userObject = user.toObject();
  userObject.accessToken = accessToken;
  delete userObject.password;
  delete userObject.authentication;

  return userObject;
};

// ==========================================================================================
// Login With (Github/Google)
// ==========================================================================================
const loginWithSocial = async body => {
  let { name, username, email, password, authMethod, providerAccessToken } = body;

  let user = await UserModel.findOne({
    $or: [{ username }, { email }]
  });

  // Check user existing
  let isExistUser = false;
  if (user) {
    isExistUser = true;
  }

  // Verify token
  authMethod = authMethod.toLowerCase();
  let isFoundUser = null;

  if (authMethod === "github") {
    const providerApi = "https://api.github.com/user";
    const response = await fetch(providerApi, {
      headers: {
        Authorization: `Bearer ${providerAccessToken}`
      }
    });
    const jsonData = await response.json();
    if (jsonData?.avatar_url) {
      isFoundUser = jsonData;
    }
  } else if (authMethod === "google") {
    const providerApi = "https://www.googleapis.com/oauth2/v3/userinfo";
    const response = await fetch(`${providerApi}?access_token=${providerAccessToken}`);
    const jsonData = await response.json();
    if (jsonData?.email) {
      isFoundUser = jsonData;
    }
  }

  // When token invalid
  if (!isFoundUser) {
    throw new CustomError(400, "Sorry, you don't have the required permission to proceed with this action.");
  }

  // If everything okey (user not exists & token valid then create user in db)
  if (!isExistUser) {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      name,
      username,
      email,
      password: hashPassword,
      authentication: {
        authMethod,
        providerAccessToken
      }
    });
    // Set newly created user to global variable
    user = await newUser.save();
  }

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const userObject = user.toObject();
  userObject.accessToken = accessToken;
  delete userObject.password;
  delete userObject.authentication;

  return userObject;
};

// ==========================================================================================
// Confirm Account
// ==========================================================================================
const confirmAccount = async (userId, token) => {
  const user = await UserModel.findById(userId).select("+authentication.confirmationToken +authentication.isConfirmed");

  if (!user) {
    throw {
      status: 400,
      message: "Account confirmation failed.Please provide valid userId & token"
    };
  }

  if (user.authentication.isConfirmed) {
    throw {
      status: 400,
      message: "Account already confirmed."
    };
  }

  user.authentication.isConfirmed = true;
  user.authentication.confirmationToken = "";
  await user.save();

  return { isConfirmed: true };
};

// ==========================================================================================
// Reset Password
// ==========================================================================================
const resetPassword = async data => {
  const { email, userId, newPassword, token, type } = data;
  let user = null;

  // To validate: userId & token in password reset link
  if (type === "validateLink") {
    user = await UserModel.findById(userId).select("+authentication.resetPasswordToken");

    if (!user || user.authentication.resetPasswordToken !== token) {
      throw new CustomError(401, "Invalid userId or token.");
    }

    return { ok: true };
  }

  if (type === "reset") {
    user = await UserModel.findOne({ email }).select("+password +authentication.resetPasswordToken");
  }

  if (type === "reset" && !user) {
    throw new CustomError(404, "User not found.");
  }

  if (type === "reset" && user?.authentication.authMethod !== "email+password") {
    throw new CustomError(400, "You are not allowed to change your account password.");
  }

  // Send email to reset password
  if (type === "reset") {
    // Generate confirmation link
    const resetPasswordToken = await generateToken();
    const resetPasswordLink = generateResetPasswordLink(user._id.toString(), resetPasswordToken);

    // Store confirmationToken in db
    user.authentication.resetPasswordToken = resetPasswordToken;
    await user.save();

    // Send account confirmation email
    const htmlEmailTemplate = generatePasswordResetEmail(user.name, resetPasswordLink);
    await sendEmail(user.email, `${PROJECT_NAME} Account Password Reset`, htmlEmailTemplate);
    return;
  }

  // =====================================================================================================================
  // Update Password
  // =====================================================================================================================
  user = await UserModel.findById(userId).select("+password +authentication.resetPasswordToken");

  if (!user) {
    throw new CustomError(404, "User not found.");
  }

  // Throw an error if the token didn't match.
  if (user.authentication.resetPasswordToken !== token) {
    throw new CustomError(400, "You don't have permission to change the password due to missing or invalid token.");
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(newPassword, saltRounds);

  user.authentication.resetPasswordToken = "";
  user.password = hash;

  await user.save();
  return { ok: true };
};

// ==========================================================================================
// Change Password
// ==========================================================================================
const changePassword = async (oldPassword, newPassword, req) => {
  const user = await UserModel.findById(req?.user?._id).select("+password");

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw new CustomError(400, "The old password provided is incorrect. Please verify the old password and try again.");
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(newPassword, saltRounds);

  user.password = hash;
  await user.save();
};

// ==========================================================================================
// Find User By Id
// ==========================================================================================
const getUserById = async userId => {
  const user = await UserModel.findById(userId)
  
  return user;
};

// ==========================================================================================
// Get Linktree Profile
// ==========================================================================================
const getLinktreeProfile = async username => {
  const user = await UserModel.findOne({
    username
  });

  let links = null;
  if (user) {
    links = await LinkModel.findOne({
      creator: user._id
    });
  }

  const userObject = user.toObject();
  delete userObject.authentication;
  delete userObject.updatedAt;
  delete userObject.createdAt;
  delete userObject.email;
  userObject.links = links;

  return userObject;
};

// ==========================================================================================
// Update Account
// ==========================================================================================
const updateAccount = async (req, data) => {
  const user = await UserModel.findById(req.user._id).select("+password");

  let isUserNameExists = false;

  if (data.username) {
    if (user.username === data.username) isUserNameExists = true;
  }

  if (isUserNameExists) {
    throw new CustomError(400, "The username you have entered is not available. Try different one.");
  }

  // Handle Password Change
  const { oldPassword, newPassword } = data;
  if (newPassword) {
    // If user registerd through email & password then don't allow to change password
    if (user.authentication.authMethod !== "email+password") {
      throw new CustomError(400, "You are not allowed to change password.");
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      throw new CustomError(400, "Old password is not correct.");
    }

    // Generate hash for new password
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    data = {
      password: hash
    };
  }

  // Handle Profile Pic Change
  if (req.file || data.removeProfilePic) {
    if (user.profilePic.publicId) {
      await deleteFromCloudinary(user.profilePic.publicId);
    }
  }

  if (data.removeProfilePic) {
    data.profilePic = {
      url: "",
      publicId: ""
    };
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...data
      }
    },
    {
      new: true
    }
  );

  return { ok: true };
};

// ==========================================================================================
// Update Linktree Profile Design
// ==========================================================================================
const updateLinktreeProfileDesign = async (userId, newData, type) => {
  const user = await UserModel.findById(userId);

  const userObject = user.toObject();
  let designToUpdate = {};

  /*
    When user set theme
    or When user upload new background image
    then delete old image
  */
  if (type === "theme" || (type === "background" && (newData.background.image.url || newData.background.color))) {
    // New file uploaded or theme changed. So, delete old file
    const deleted = await deleteFromCloudinary(userObject.design.background.image.publicId);

    userObject.design.background.image = {
      url: "",
      publicId: ""
    };
  }

  switch (type) {
    case "buttonStyle":
    case "fontStyle":
    case "background":
      designToUpdate = { ...userObject.design[type], ...newData[type] };
      break;

    case "theme":
      designToUpdate = newData.theme;
      break;

    default:
      designToUpdate = newData.socialPosition;
  }

  if (newData.background) {
    user.design.theme = "";
  }
  if (newData.theme) {
    user.design.background = { url: "", publicId: "" };
  }

  user.design[type] = designToUpdate;
  const res = await user.save();

  return { ok: true };
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
