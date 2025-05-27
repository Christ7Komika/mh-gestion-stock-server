import multer from "multer";
import { Request } from "express";

const storageEngine = multer.diskStorage({
  destination: "./src/upload/",
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, Date.now() + "---" + file.originalname);
  },
});

const uploadImageFile = multer({
  storage: storageEngine,
}).single("logo");

export default uploadImageFile;
