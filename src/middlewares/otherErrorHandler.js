import rateLimit from "express-rate-limit";
import multer from "multer";

const otherErrorHandler = (error, req, res, next) => {
  if (error?.name === "RateLimitError") {
    res.status(429).json({
      error: "Too many requests, please try again later"
    });

    return;
  }

  // Multer error handling
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(error?.status || 500).json({
        status: "Failed",
        error: {
          message: "File size limit exceeded (Max: 500 KB)"
        }
      });
    }
  }

  res.status(error?.status || 500).json({
    status: "Failed",
    error: {
      message: error?.message || "Internal server error"
    }
  });
};

export default otherErrorHandler;
