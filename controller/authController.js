const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User,validationRegistoreUser,validationLoginUser } = require("../models/User");


/**
* @desc Registor New User - SignUp
* @Route /api/auth/register
* @method POST
* @access public
*/
module.exports.registerUserController = asyncHandler(async(req,res)=>{
    const {error} = validationRegistoreUser(req.body);//validation
    if(error){ // status 400 mean bad request
        return res.status(400).json({message: error.details[0].message});
    }
    let user = await User.findOne({email: req.body.email}); // check if user is exist
    if(user){
        return res.status(400).json({message : "user already exist"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    user = new User({
        username: req.body.username,
        email : req.body.email,
        password : hashedPassword
    });

    // save user to database
    await user.save();
    
    // status 201 mean success
    res.status(201).json({message: "you registered successfully, please login"})
});


/**
* @desc Login User
* @Route /api/auth/login
* @method POST
* @access public
*/

module.exports.loginUserController = asyncHandler(async(req,res)=>{
    const {error} = validationLoginUser(req.body); // Validation
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }

    const user = await User.findOne({email: req.body.email}); // Check if user is in db
    if(!user){
        return res.status(400).json({message: "invalid email or password"});
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password,user.password); // Check if password match with hashing
    if(!isPasswordMatch){
        return res.status(400).json({message: "invalid email or password"});
    }

    // @TODO EMAIL VERIFICATION

    const token = user.generateAuthToken();

    res.status(200).json({
        _id : user._id,
        isAdmin : user.isAdmin,
        profilePhoto : user.profilePhoto,
        token
    });

});