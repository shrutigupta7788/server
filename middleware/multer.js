import multer from "multer";
import fs from 'fs'

const strorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
})


const upload = multer({ storage: strorage})
 
export default upload;