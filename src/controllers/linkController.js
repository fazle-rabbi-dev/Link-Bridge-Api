import asyncHanlder from "express-async-handler";
import LinkModel from "../models/LinkModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import CustomError from "../utils/CustomError.js";
import { validateDocumentId } from "../utils/helpers.js";
import { validationResult } from "express-validator";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// In the bellow code docType means => linkType

// =======================================================================================
// Add A New Link
// =======================================================================================
export const addLink = asyncHanlder(async (req, res) => {
  const { creator, title, url } = req.body;
  const { docType } = req.query;

  const error = validationResult(req);
  const isValidId = validateDocumentId(creator);
  const userId = req.user?._id;

  if (!isValidId || userId !== creator) {
    throw new CustomError(400, "Invalid creator id.");
  }

  if (!error.isEmpty()) {
    throw new CustomError(400, "Required the following fields: creator, title, url");
  }

  if (!docType) {
    throw new CustomError(400, "Missing the following query parameter: docType (socialLinks/customLinks)");
  }

  const filePath = req.file?.path;
  let iconUrl = "";
  let iconId = "";

  // If an icon is uploaded, then upload it to Cloudinary.
  if (filePath) {
    const res = await uploadOnCloudinary(filePath);
    iconUrl = res?.secure_url || "";
    iconId = res?.public_id || "";
  }

  const newData = {
    title,
    url,
    iconUrl,
    iconId
  };

  // Check if a document exists for the user
  const existingLink = await LinkModel.findOne({ creator: userId });
  let newEntry = {};

  // If a document exists, update the existing document by pushing the new link
  if (existingLink) {
    existingLink[docType].push(newData);

    const updatedLink = await existingLink.save();
    newEntry = updatedLink;
  }
  // If a document doesn't exist, create a new document for the user
  else {
    const newLink = new LinkModel({
      creator: userId,
      [docType]: [newData]
    });

    const savedLink = await newLink.save();
    newEntry = savedLink;
  }

  res.status(201).json(new ApiResponse("Success", newEntry, "New link added successfully"));
});

// =======================================================================================
// Get All Links
// =======================================================================================
export const getLinks = asyncHanlder(async (req, res) => {
  const userId = req.user?._id;

  const linkDoc = await LinkModel.findOne({
    creator: userId
  });

  res.status(201).json(new ApiResponse("Success", linkDoc, "Links found successfully."));
});

// =======================================================================================
// Update Link
// =======================================================================================
export const updateLink = asyncHanlder(async (req, res) => {
  const { title, url } = req.body;
  const { docId } = req.params;
  const { docType } = req.query;
  const docTypeLists = ["customLinks", "socialLinks"];

  const error = validationResult(req);
  const isValidId = validateDocumentId(docId);
  const userId = req.user?._id;

  if (!docType || !docTypeLists.includes(docType)) {
    throw new CustomError(400, "Missing or invalid the following query parameter: deleteFrom (customLinks/socialLinks)");
  }

  if (!isValidId) {
    throw new CustomError(400, "Invalid document id.");
  }

  if (!error.isEmpty()) {
    throw new CustomError(400, "Required the following fields: id (document id), title, url, iconId (if icon changed)");
  }

  const documentToUpdate = await LinkModel.findOne({ creator: userId });

  if (!documentToUpdate) {
    throw new CustomError(400, "Oops! No document found matching the specified criteria.");
  }

  const indexToUpdate = documentToUpdate[docType].findIndex(link => link._id.toString() === docId);

  if (indexToUpdate === -1) {
    throw new CustomError(400, `${docType} with ID '${docId}' not found in doc '${documentToUpdate?._id}'.`);
  }

  const filePath = req.file?.path;
  let iconUrl = "";
  let iconId = "";

  // When new icon uploaded delete old icon from cloudinary
  if (filePath) {
    const oldFileId = documentToUpdate[docType][indexToUpdate]?.iconId;
    if (oldFileId) {
      await deleteFromCloudinary(oldFileId);
    }

    // Upload new icon
    const uploadRes = await uploadOnCloudinary(filePath);
    iconUrl = uploadRes?.secure_url || "";
    iconId = uploadRes?.public_id || "";
  }

  const updatedData = {
    title,
    url
  };

  if (iconUrl) {
    updatedData.iconUrl = iconUrl;
    updatedData.iconId = iconId;
  }

  // ################################
  // Update Document
  // ################################

  // Update the element using spread operator for clarity and value immutability
  documentToUpdate[docType][indexToUpdate] = {
    ...documentToUpdate[docType][indexToUpdate],
    ...updatedData
  };

  const updatedDoc = await documentToUpdate.save();

  res.status(201).json(new ApiResponse("Success", updatedDoc, "Link updated successfully."));
});

// =======================================================================================
// Delete Link
// =======================================================================================
export const deleteLink = asyncHanlder(async (req, res) => {
  const { docId } = req.params;
  const userId = req.user?._id;
  const isValidId = validateDocumentId(docId);
  const { docType } = req.query;
  const docTypeLists = ["customLinks", "socialLinks"];

  if (!docType || !docTypeLists.includes(docType)) {
    throw new CustomError(400, "Missing or invalid the following query parameter: deleteFrom (customLinks/socialLinks)");
  }

  if (!docId || !isValidId) {
    throw new CustomError(400, "Invalid document id.Required a valid document id to complete delete operation.");
  }

  const documentToDelete = await LinkModel.findOne({
    creator: userId
  });

  if (!documentToDelete) {
    throw new CustomError(400, "Oops! No document found matching the specified id.");
  }

  const indexToDelete = documentToDelete[docType].findIndex(link => link._id.toString() === docId);

  if (indexToDelete === -1) {
    throw new CustomError(400, `${docType} with ID '${docId}' not found in doc '${documentToDelete?._id}'.`);
  }

  // Delete icon from cloudinary if exists
  const iconId = documentToDelete[docType][indexToDelete]?.iconId;
  if (iconId) {
    await deleteFromCloudinary(iconId);
  }

  // Delete document
  documentToDelete[docType].splice(indexToDelete, 1);
  const deletedDoc = await documentToDelete.save();

  res.status(200).json(new ApiResponse("Success", deletedDoc, "Link deleted successfully."));
});

// =====================================================================================================================
// Link Click Counting
// =====================================================================================================================
export const countLinkClick = asyncHanlder(async (req, res) => {
  const { docId } = req.params;
  const { creator, linkType } = req.body;

  if (!creator) {
    throw new CustomError(400, "Missing creator field in the request body.");
  }

  let link = await LinkModel.findOne({ creator });

  if (!link) {
    throw new CustomError(404, "Link not found");
  }

  let linkArray = linkType === "social" ? link.socialLinks : link.customLinks;
  let clickedLink = linkArray.find(link => link._id.toString() === docId);

  if (!clickedLink) {
    throw new CustomError(404, "Link not found");
  }

  // Increment click count
  clickedLink.clickCount += 1;

  // Add new click history entry
  clickedLink.clickHistory.push({ clickedAt: new Date() });

  const updatedLink = await link.save();

  res.status(200).json(new ApiResponse("Success", { ok: true }, "Link count updated successfully."));
});

// =====================================================================================================================
// Link Stats
// =====================================================================================================================
export const getLinkStats = asyncHanlder(async (req, res) => {
  const creator = req.user._id;

  const linkDoc = await LinkModel.findOne({ creator });

  if (!linkDoc) {
    throw new CustomError(404, "Link not found.");
  }

  const links = [];
  linkDoc.socialLinks.map(link => links.push(link));

  linkDoc.customLinks.map(link => links.push(link));

  res.status(200).json(new ApiResponse("Success", links, "Link stats found successfully."));
});
