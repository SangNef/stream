import multer from "multer";
import fs from "fs";
import { Request } from "express";

const UPLOADS_FOLDER = "../../../public/uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpeg", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File không hợp lệ. Chỉ chấp nhận ảnh và video."));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn kích thước 50MB
  fileFilter: fileFilter,
});

export default upload;
