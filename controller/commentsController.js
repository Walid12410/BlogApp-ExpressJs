const asyncHandler = require("express-async-handler");
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/Comment");
const { User } = require("../models/User");


/**
* @desc Create New Comment
* @Route /api/comments
* @method Post
* @access private (only logged in user)
*/
module.exports.createCommentController = asyncHandler(async (req, res) => {
    const { error } = validateCreateComment(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username
    });

    res.status(201).json(comment);
});


/**
* @desc Get All Comment
* @Route /api/comments
* @method GET
* @access private (only admin)
*/
module.exports.getAllCommentsController = asyncHandler(async (req, res) => {
    const comments = await Comment.find().populate("user", ["-password"]);
    res.status(200).json(comments);
});

/**
* @desc Delete Comment by Id
* @Route /api/comments/:id
* @method DELETE
* @access private (only admin or owner of the comment)
*/
module.exports.deleteCommentsController = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: "comment not found" });
    }

    if (req.user.isAdmin || req.user.id === comment.user.toString()) {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "comment has been deleted" });
    } else {
        res.status(403).json({ message: "access denied, not allowed" });
    }
});