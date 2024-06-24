const clouidnary = require("cloudinary");

clouidnary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Upload Image
const cloudinaryUploadImage = async(fileToUpload) =>{
    try {
        const data = await clouidnary.uploader.upload(fileToUpload,{
            resourse_type: 'auto',
        });
        return data;
    } catch (error) {
        return error;
    }
}

// Cloudinary Remove Image
const cloudinaryRemoveImage = async(imagePublicId) =>{
    try {
        const result = await clouidnary.uploader.destroy(imagePublicId);
        return result;
    } catch (error) {
        return error;
    }
}


module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage
}