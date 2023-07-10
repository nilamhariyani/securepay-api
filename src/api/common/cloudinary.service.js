const cloudinary = require('../../config/cloudinary')
const AppError = require('../../utils/AppError');
const httpStatus = require('http-status');

const uploadOnCloudinary = async (filePath, originalname) => {
    try {
        let obj;
        console.log(originalname);
        let check = originalname.split('.').pop();

        console.log(check, '--------')
        if (check === 'docx' || check === 'doc' || check === 'xlsx' || check === 'xls') {
            obj = {
                folder: process.env.CLOUDINARY_FOLDER,
                resource_type: "raw",
                public_id: originalname,
            }
        } else {
            obj = {
                folder: process.env.CLOUDINARY_FOLDER
            }
        }
        // console.log(obj);
        const imageData = await cloudinary.v2.uploader.upload(filePath, obj);
        return imageData
    } catch (err) {
        console.log(err)
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Fail to upload on cloudinary');
    }
}

module.exports = { uploadOnCloudinary } 