const router = require("express").Router();
const { createCommentController, getAllCommentsController, deleteCommentsController, updateCommentController } = require("../controller/commentsController");
const {verifyToken, verifyTokenAndAdmin} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


// /api/comments
router.route("/")
      .post(verifyToken,createCommentController)
      .get(verifyTokenAndAdmin,getAllCommentsController)

// /api/comments/:id
router.route("/:id")
      .delete(validateObjectId,verifyToken,deleteCommentsController)
      .put(validateObjectId,verifyToken,updateCommentController);

module.exports = router;