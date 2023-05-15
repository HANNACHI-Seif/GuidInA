import { NextFunction } from 'express'
import multer, { FileFilterCallback, MulterError } from 'multer'


type FileNameCallback = (error: Error | null, filename: string) => void

let storage = multer.diskStorage({ 
    destination: './uploads/images',
    filename: (req , file: Express.Multer.File, cb: FileNameCallback) => {
        cb(null, Date.now() + file.originalname)
    }
})

let fileFilter = (req : any, file: Express.Multer.File, cb: FileFilterCallback) => {
    const error = new MulterError("LIMIT_UNEXPECTED_FILE");
    error.name = "MulterError";
    error.message = "you must upload image files only!"
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' ) {
        cb(null, true)
    } else cb(error)
}

let limits = {
    fileSize: 1024 * 1024 * 10 //10 MB
}

let upload = multer({
    storage,
    fileFilter,
    limits
})

const handleImageUpload = (req: any, res: any, next: NextFunction) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof MulterError) {
        // Multer error occurred
        console.log(err.code, err.message)
        if (err.code == "LIMIT_FILE_SIZE") {
            res.json({ msg: "file size too large" })
        } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
            res.json({ msg: err.message })
        }
      } else if (err) {
        // Other error occurred
        console.log(err)
        return res.json({ message: 'Unexpected error occurred during file upload' });
      } else {
        // File upload successful
        next();
      }
    });
  };

export default handleImageUpload
