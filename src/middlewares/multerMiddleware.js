import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/temp"),
  filename: (req, file, cb) => {
    cb(null, `${file.originalname.split(".")[0]}-${Date.now()}.${file.originalname.split(".")[1]}`);
  }
});

// Limit maximum file size to 500kb
const limits = {
  fileSize: 500 * 1024
};

const fileFilter = (req, file, cb) => {
  // Allow Only Image File Upload
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({
  storage,
  limits,
  fileFilter
});
