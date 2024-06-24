const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");


// User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            publicId: null,
        }
    },
    bio: String,
    isAdmin: {
        type:Boolean,
        default : false
    },
    isAccountVerified: {
        type:Boolean,
        default : false
    }
},{
    timestamps : true,
    toJSON: { virtuals: true }, // to let virtual work
    toObject :{virtuals : true}, // to let virtual work
});

// Populate Post That Belong To This User When he/she Get his/her Profile
UserSchema.virtual("posts",{
    ref: "Post",
    foreignField: "user",
    localField : "_id",
});


// Generate Auth Token
UserSchema.methods.generateAuthToken = function() {
    return jwt.sign({id: this._id, isAdmin : this.isAdmin},process.env.JWT_SECRET);
}

// User Model
const User = mongoose.model("User", UserSchema);

// Validation Register User
function validationRegistoreUser(obj){
    const schema = Joi.object({
        username : Joi.string().min(2).max(100).trim().required(),
        email : Joi.string().min(5).max(100).trim().required().email(),
        password : Joi.string().min(8).trim().required(),
    });
    return schema.validate(obj);
}

// Validation Login User
function validationLoginUser(obj){
    const schema = Joi.object({
        email : Joi.string().min(5).max(100).trim().required().email(),
        password : Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// Validation Update User
function validationUpdateUserProfile(obj){
    const schema = Joi.object({
        username : Joi.string().min(2).max(100).trim(),
        password : Joi.string().min(8).trim(),
        bio: Joi.string(),
    });
    return schema.validate(obj);
}


module.exports = {
    User,
    validationRegistoreUser,
    validationLoginUser,
    validationUpdateUserProfile
}