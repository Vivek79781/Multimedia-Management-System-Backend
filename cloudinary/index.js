const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { query } = require('../utils/db');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const fileUpload = async(file) => {
    const maxId = await query(`SELECT MAX(id) FROM Multimedia`);
    const response = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${maxId[0]['MAX(id)']}.${file.name}`,
        resource_type: 'auto',
        // raw_convert: 'aspose',
        folder: 'Multimedia'
    });
    return {
        link: response.secure_url,
        public_id: response.public_id
    }
}

module.exports = {
    cloudinary,
    fileUpload
}