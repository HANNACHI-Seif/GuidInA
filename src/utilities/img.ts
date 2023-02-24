import multer, { FileFilterCallback } from 'multer'


type FileNameCallback = (error: Error | null, filename: string) => void

let storage = multer.diskStorage({ 
    destination: './uploads',
    filename: (req , file: Express.Multer.File, cb: FileNameCallback) => {
        cb(null, file.originalname)
    }
})

let fileFilter = (req : any, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' ) {
        cb(null, true)
    } else cb(null, false)
}

let limits = {
    fileSize: 1024 * 1024  * 2
}

let upload = multer({
    storage,
    fileFilter,
    limits
})

export default upload
