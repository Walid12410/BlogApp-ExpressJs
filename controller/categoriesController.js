const asyncHandler = require("express-async-handler");
const { Category,validateCreateCategory } = require("../models/Category");
const { User } = require("../models/User");


/**
* @desc Create New Category
* @Route /api/categories
* @method Post
* @access private (only admin)
*/

module.exports.createCategoryController = asyncHandler(async(req,res)=>{
    const {error} = validateCreateCategory(req.body);
    if(error){
        return res.status(400).json({message : error.details[0].message});
    }

    const category = await Category.create({
        title: req.body.title,
        user: req.user.id
    });

    res.status(201).json(category);
});


/**
* @desc Get All Categories
* @Route /api/categories
* @method Get
* @access public 
*/

module.exports.getAllCategoriesController = asyncHandler(async(req,res)=>{
    const categories = await Category.find();
    res.status(200).json(categories);
});

/**
* @desc Delete Category by Id
* @Route /api/categories/:id
* @method Delete
* @access private(only admin) 
*/

module.exports.deleteCategoryController = asyncHandler(async(req,res)=>{
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(404).json({message : "category not found"});
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({message :"Category has been deleted successfully",categoryId : category._id});
});