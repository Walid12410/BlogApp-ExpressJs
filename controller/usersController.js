const asyncHandler = require("express-async-handler");
const { User, validationUpdateUserProfile } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const {cloudinaryUploadImage,cloudinaryRemoveImage,cloudinaryRemoveMultipleImage} = require("../utils/cloudinary");
const fs = require("fs");//file system
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");


/**
* @desc Get All User Profile
* @Route /api/users/profile
* @method GET
* @access private (only admin)
*/
module.exports.getAllUserController = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);
});

/**
* @desc Get User Profile By Id
* @Route /api/users/profile/:id
* @method GET
* @access public
*/
module.exports.getUserProfileController = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User Not Found" });
    }
});

/**
* @desc Update User Profile By Id
* @Route /api/users/profile/:id
* @method PUT
* @access private (only user himself)
*/
module.exports.updateUserProfileController = asyncHandler(async (req, res) => {
    const { error } = validationUpdateUserProfile(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
    }, { new: true }).select("-password");

    res.status(200).json(updatedUser);

});

/**
* @desc Get Users Count
* @Route /api/users/count
* @method GET
* @access private (only admin)
*/
module.exports.getUserCountController = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count);
});

/**
* @desc Profile Photo Upload
* @Route /api/users/profile/profile-photo-upload
* @method POST
* @access private (only logged in user)
*/

module.exports.profilePhotoUploadController = asyncHandler(async(req,res)=>{
    //1.validation
    if(!req.file){
        return res.status(400).json({message : "no file provided"})
    }

    //2. Get the pass of the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    //3. upload to clouidnary
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    //4. Get the user from DB
    const user = await User.findById(req.user.id);

    //5. Delete the old profile photo if exist
    if(user.profilePhoto.publicId !== null){
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }


    //6. Change the profilePhoto field in the DB
    user.profilePhoto = {
        url: result.secure_url, //the url of the cloudinary will show in the console result
        publicId: result.public_id
    }
    await user.save();

    //7. Send res to client
    res.status(200).json({message: "your profile photo upload successfully",
        profilePhoto: {url: result.secure_url, public_id: result.public_id}
    });

    //8. Remove image from the server
    fs.unlinkSync(imagePath); // give here imagepath to delete it from server

});

/**
* @desc Delete User Profile (Remove Account)
* @Route /api/users/profile/:id
* @method Delete
* @access private (only admin or user himself)
*/

module.exports.deleteUserProfileCtrl = asyncHandler(async(req,res)=>{
    // 1. Get the user from DB
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: "user not found"});
    }
    
    // 2. Get all posts from DB 
    const posts = await Post.find({ user: user._id });


    // 3. Get the public ids from posts
    const publicIds = posts?.map((post)=> post.image.publicId);
    
    // 4. Delete all posts image from cloudinary that belong to this user
    if(publicIds?.length > 0 ){
        await cloudinaryRemoveMultipleImage(publicIds);
    }

    // 5. Delete the profile picture from cloudinary
    await cloudinaryRemoveImage(user.profilePhoto.publicId);

    // 6. Delete user posts & comments
    await Post.deleteMany({ user : user._id });
    await Comment.deleteMany({ user: user._id });

    // 7. Delete the user himself
    await User.findByIdAndDelete(req.params.id);
    
    // 8. Send a response to the client
    res.status(200).json({message: "your profile has been deleted"});

});

