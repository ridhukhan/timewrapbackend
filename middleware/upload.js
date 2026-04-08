import multer from "multer";

// File memory তে রাখবো, তারপর cloudinary তে পাঠাবো
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

export default upload;