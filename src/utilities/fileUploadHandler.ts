import multer, { FileFilterCallback, MulterError } from 'multer'
import { NextFunction } from 'express'

type FileNameCallback = (error: Error | null, filename: string) => void

let storage = multer.diskStorage({ 
    destination: './uploads/pdfs',
    filename: (req , file: Express.Multer.File, cb: FileNameCallback) => {
        cb(null, Date.now() + file.originalname)
    }
})

let limits = {
    fileSize: 1024 * 1024 * 10 //10 MB
}

let fileFilter = (req : any, file: Express.Multer.File, cb: FileFilterCallback) => {
    const error = new MulterError("LIMIT_UNEXPECTED_FILE");
    error.name = "MulterError";
    error.message = "you must upload pdf files only!"
    if (file.mimetype === 'application/pdf' ) {
        cb(null, true)
    } else cb(error)
}

let upload = multer({
    storage,
    fileFilter,
    limits
})

const handleFileUpload = (req: any, res: any, next: NextFunction) => {
    upload.single('cv_file')(req, res, (err) => {
      if (err instanceof MulterError) {
        console.log(err.code, err.message)
        if (err.code == "LIMIT_FILE_SIZE") {
            res.json({ msg: "file size too large" })
        } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
            res.status(500).json({ msg: err.message })
        }
      } else if (err) {
        return res.status(500).json({ message: 'Unexpected error occurred during file upload' });
      } else {

        next();
      }
    });
  };

  
export default handleFileUpload