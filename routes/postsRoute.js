const router = require("express").Router();
const { 
      createPostController,
      getAllPostsController,
      getSinglePostController,
      getPostCountController,
      deletePostController,
      updatePostController,
      updateImagePostController,
       toggleLikeController
} = require("../controller/postController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken } = require("../middlewares/verifyToken");

// /api/post
router.route("/")
      .post(verifyToken,photoUpload.single("image"),createPostController)
      .get(getAllPostsController);
    
// /api/post/count
router.route("/count")
      .get(getPostCountController);

// /api/post/:id
router.route("/:id")
      .get(getSinglePostController)
      .delete(validateObjectId,verifyToken,deletePostController)
      .put(validateObjectId,verifyToken,updatePostController);


// /api/posts/update-image/:id
router.route("/update-image/:id")
      .put(validateObjectId,verifyToken,photoUpload.single("image"),updateImagePostController);

// /api/posts/like/:id
router.route("/like/:id")
      .put(validateObjectId,verifyToken,toggleLikeController);


module.exports = router;