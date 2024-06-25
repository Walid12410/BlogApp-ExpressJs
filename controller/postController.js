const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { Post, validateCreatePost, validateUpdatePost } = require("../models/Post");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");

/**
* @desc Create New Post
* @Route /api/posts
* @method POST
* @access private (only logged in user)
*/

module.exports.createPostController = asyncHandler(async (req, res) => {
    // 1. Validation for image
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" });
    }

    // 2. Validation for data
    const { error } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    // 4. Create new post and save it to DB
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    });

    await post.save();

    // 5. send response to the client
    res.status(201).json(post);

    // 6.Remove image from the server
    fs.unlinkSync(imagePath);
});

/**
* @desc Get All Posts
* @Route /api/posts
* @method GET
* @access public
*/
module.exports.getAllPostsController = asyncHandler(async (req, res) => {
    const POST_PER_PAGE = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if (pageNumber) {
        posts = await Post.find()
            .skip((pageNumber - 1) * POST_PER_PAGE)
            .limit(POST_PER_PAGE)
            .populate("user", ["-password"]);
    } else if (category) {
        posts = await Post.find({ category })
            .populate("user", ["-password"]);
    } else {
        posts = await Post.find().sort({ createdAt: -1 })
            .populate("user", ["-password"]);
    }
    res.status(200).json(posts);
});

/**
* @desc Get Single Posts
* @Route /api/posts/:id
* @method GET
* @access public
*/
module.exports.getSinglePostController = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments")
    if (!post) {
        return res.status(404).json({ message: 'post not found' });
    }

    res.status(200).json(post);
});

/**
* @desc Get Post Count
* @Route /api/posts/count
* @method GET
* @access public
*/
module.exports.getPostCountController = asyncHandler(async (req, res) => {
    const count = await Post.countDocuments();
    res.status(200).json(count);
});

/**
* @desc Delete Post
* @Route /api/posts/:id
* @method Delete
* @access private(only admin or owner of the post)
*/
module.exports.deletePostController = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'post not found' });
    }

    if (req.user.isAdmin || req.user.id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

        // delete all comment that belong to this post
        await Comment.deleteMany({ postId: post._id });

        res.status(200).json({ message: "post has been deleted successfully", postId: post._id });
    } else {
        res.status(403).json({ message: "access denied, forbidden" });
    }
});

/**
* @desc Update Post
* @Route /api/posts/:id
* @method PUT
* @access private (only owner of the post)
*/
module.exports.updatePostController = asyncHandler(async (req, res) => {
    //1. Validation Funtion
    const { error } = validateUpdatePost(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    // 2. Get the post from DB and check if post exist
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'post not found' });
    }

    // 3. Check if this post belong to logged in user
    if (req.user.id != post.user.toString()) {
        return res.status(403).json({ message: "access denied, you are not allowed" });
    }

    // 4. Update the post

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
        }
    }, { new: true }).populate("user", ["-password"]);

    // 5. send response to client
    res.status(200).json(updatedPost);

});

/**
* @desc Update Post Image
* @Route /api/posts/upload-image/:id
* @method PUT
* @access private (only owner of the post)
*/
module.exports.updateImagePostController = asyncHandler(async (req, res) => {
    //1. Validation 
    if (!req.file) {
        return res.status(404).json({ message: "no image provided" });
    }

    // 2. Get the post from DB and check if post exist
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'post not found' });
    }

    // 3. Check if this post belong to logged in user
    if (req.user.id != post.user.toString()) {
        return res.status(403).json({ message: "access denied, you are not allowed" });
    }

    // 4. delete old image
    await cloudinaryRemoveImage(post.image.publicId);

    // 5. upload new photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    // 6. Update the image field in the DB
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, { new: true });

    // 7. Send response to client
    res.status(200).json(updatedPost);

    // 8. Remove image from the server
    fs.unlinkSync(imagePath);
});


/**
* @desc Toggle Like
* @Route /api/posts/like/:id
* @method PUT
* @access private (only logged in user)
*/
module.exports.toggleLikeController = asyncHandler(async (req, res) => {
    const loggedInUser = req.user.id;
    const { id: postId } = req.params;

    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser);
    //Pull delete from array(mangoose)
    if (isPostAlreadyLiked) {
        post = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loggedInUser }
        }, { new: true });
    } else {
        post = await Post.findByIdAndUpdate(postId, {
            $push: { likes: loggedInUser }
        }, { new: true });
    }

    res.status(200).json(post);
});