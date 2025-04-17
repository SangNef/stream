import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(__dirname, '../../../public/uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

export const deleteImageDir = (imageName: string) => {
  const pathImage = path.join(
    "D:\\VS_Code\\CtyDev\\Naughty\\BE\\TMDT\\public\\uploads",
    imageName
  );
  fs.unlink(pathImage, (err) => {
    if(err){
      console.error('Lỗi khi xóa ảnh khỏi thư mục hệ thống: ', err);
      return false;
    }
  });
  return true;
}

export const upload = multer({ storage: storage });