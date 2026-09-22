import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadCategoryImage = upload.single("thumbnailimage");
export const uploadBannerImage = upload.single("bannerimage");

export const uploadProductImages = upload.fields([
  { name: "thumbnailimage", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

export const saveImage = async (buffer, folder, width, height) => {
  const uploadDir = path.join(__dirname, `../../public/uploads/${folder}`);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
  await sharp(buffer)
    .resize(width, height, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
    .jpeg({ quality: 80 })
    .toFile(path.join(uploadDir, filename));

  return `/uploads/${folder}/${filename}`;
};

export const deleteImage = (imagePath) => {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "../../public", imagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};
