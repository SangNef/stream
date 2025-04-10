import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { Request, Response, NextFunction } from "express";
export const compressFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please choose file to upload!" });
  }

  const file = req.file;
  const originalPath = file.path;
  const outputPath = path.join(file.destination, `compressed_${file.filename}`);

  if (file.mimetype.startsWith("video/")) {
    ffmpeg(file.path)
      // .outputOptions('-vf', 'scale=1280:720')  // Resize video
      .outputOptions("-crf", "30") // Lower quality (higher CRF means lower quality) from 0-51
      .on("end", () => {
        if (req.file) {
          req.file.path = outputPath; // Không cần dùng non-null assertion
        }
        next();
      })
      .on("error", (err) => {
        console.error("Error compressing video:", err);
        res.status(500).send("Error compressing video.");
      })
      .save(outputPath);
  } else if (file.mimetype.startsWith("image/")) {
    console.log("file", file.path);
    ffmpeg(file.path)
      // .outputOptions('-vf', `scale=200:200`)
      .outputOptions("-q:v", "10") // Lower quality (higher value means lower quality) from 2 to 31
      .on("end", () => {
        if (req.file) {
          req.file.path = outputPath; // Không cần dùng non-null assertion
        }
        next();
      })
      .on("error", (err) => {
        console.error("Error compressing image:", err);
        res.status(500).send("Error compressing image.");
      })
      .save(outputPath);
  } else {
    return res.status(400).send("Unsupported file type.");
  }
};

export const compressFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Please choose files to upload!" });
  }

  const files = req.files; // Lấy danh sách tệp
  let processedFiles = 0; // Đếm số tệp đã xử lý

  (files as any[]).forEach((file: any) => {
    const originalPath = file.path;
    const outputPath = path.join(
      file.destination,
      `compressed_${file.filename}`
    );

    if (file.mimetype.startsWith("video/")) {
      ffmpeg(file.path)
        .outputOptions("-crf", "30") // Giảm chất lượng video
        .on("end", () => {
          file.path = outputPath; // Cập nhật đường dẫn tệp nén
          processedFiles++; // Đếm số tệp đã nén
          if (processedFiles === files.length) {
            next(); // Gọi next() khi tất cả tệp đã được nén
          }
        })
        .on("error", (err) => {
          console.error("Error compressing video:", err);
          res.status(500).send("Error compressing video.");
        })
        .save(outputPath);
    } else if (file.mimetype.startsWith("image/")) {
      ffmpeg(file.path)
        .outputOptions("-q:v", "10") // Giảm chất lượng ảnh
        .on("end", () => {
          file.path = outputPath; // Cập nhật đường dẫn tệp nén
          processedFiles++; // Đếm số tệp đã nén
          if (processedFiles === files.length) {
            next(); // Gọi next() khi tất cả tệp đã được nén
          }
        })
        .on("error", (err) => {
          console.error("Error compressing image:", err);
          res.status(500).send("Error compressing image.");
        })
        .save(outputPath);
    } else {
      res.status(400).send("Unsupported file type.");
    }
  });
};
