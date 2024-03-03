import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  token = token?.split(" ")[1];

  if (!token) {
    return res.status(401).json(new ApiError("Failed", "Authorization token is missing"));
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json(new ApiError("Failed", "Invalid or expired access token.Please provide a valid access token."));
  }
};

export default authMiddleware;
