const router = require("express").Router();
const { getAllUserController, getUserProfileController, updateUserProfileController,deleteUserProfileCtrl, getUserCountController, profilePhotoUploadController } = require("../controller/usersController");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser,verifyToken,verifyTokenAndAuthorization } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");


// /api/user/profile
router.route("/profile")
    .get(verifyTokenAndAdmin, getAllUserController);

// /api/user/profile/:id
router.route("/profile/:id")
    .get(validateObjectId,getUserProfileController)
    .put(validateObjectId,verifyTokenAndOnlyUser,updateUserProfileController)
    .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl);

// /api/user/count
router.route("/count")
    .get(verifyTokenAndAdmin, getUserCountController);

// /api/user/profile/profile-photo-upload
router.route("/profile/profile-photo-upload")
        .post(verifyToken, photoUpload.single("image") ,profilePhotoUploadController);
//single mean 1 image only upload



module.exports = router;


