const ErrorResponse = require('../ulits/errorresponse')
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../ulits/sendemail')

//@desc get all users
//@routes GET/api/v1/auth/register
//@access Private/admin

exports.getUsers = asyncHandler(async (req,res,next) => {
    res.status(200).json(res.advanceResults)
})

//@desc Single user
//@routes POST/api/v1/auth/register
//@access Private/admin

exports.getUser = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success : true,
        data : user
    })
})

//@desc  Create user
//@routes POST/api/v1/auth/register
//@access Private/admin

exports.createUser = asyncHandler(async (req,res,next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success : true,
        data : user
    })
})

//@desc  Updated user
//@routes POST/api/v1/auth/register
//@access Private/admin

exports.updateUser = asyncHandler(async (req,res,next) => {
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true,runValidators : true});

    res.status(200).json({
        success : true,
        data : user
    })
})

//@desc  Delete user
//@routes POST/api/v1/auth/register
//@access Private/admin

exports.deleteUser = asyncHandler(async (req,res,next) => {
    const user = await User.findByIdAndDelete(req.params.id,req.body,{new : true,runValidators : true});

    res.status(200).json({
        success : true,
        data : user
    })
})