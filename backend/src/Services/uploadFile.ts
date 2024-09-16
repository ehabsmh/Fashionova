import multer from "multer";
import { v4 as uuid4 } from "uuid"
import { Request } from "express";
import cloudinary from "./cloudinaryConfig";

// let publicId = '';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './backend/tmp/uploads/');
    },
    filename: function (req, file, cb) {
        // publicId = uuid4();
        cb(null, uuid4());
    }
})

async function fileFilter(req: Request, file: { mimetype: string; }, cb: <T> (arg0: T, arg1: boolean) => void) {
    // if (await Category.findOne({ name: req.body.name })) {
    //     cb<Error>(new Error('Category already exists.'), false);
    // }
    if (file.mimetype.startsWith('image')) cb<null>(null, true);
    else cb<Error>(new Error('Only images supported.'), false)
}

export const uploadFileToCloud = async (imagePath: string, folder: string, width: number = 200, height: number = 200) => {
    const result = await cloudinary.uploader.upload(imagePath, { folder });
    const url = cloudinary.url(result.public_id, {
        transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width, height, crop: 'fill', gravity: 'auto' }
        ]
    });

    return url;
}

const upload = multer({ storage, fileFilter });
export default upload;
