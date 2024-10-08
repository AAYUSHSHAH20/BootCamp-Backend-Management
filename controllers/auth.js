const ErrorResponse = require('../ulits/errorresponse')
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../ulits/sendemail')
const crypto = require('crypto')

//@desc register user
//@routes POST/api/v1/auth/register
//@access Public

exports.register = asyncHandler(async (req,res,next) => {
    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,email,password,role
    })

    sendTokenResponse(user , 200 , res);
})
 
//@desc login user
//@routes POST/api/v1/auth/login
//@access Public

exports.login = asyncHandler(async (req,res,next) => {
    const {email,password} = req.body;

    //validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please provid email and password'),401)
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid Cerdentials'),401);
    } 
    
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid Cerdentials'),401)
    }

    sendTokenResponse(user , 200 , res);
})

//@desc Logout user/clear cookie
//@routes GET /api/v1/auth/me
//@access Private
exports.logout = asyncHandler(async (req,res,next) => {
    res.cookie('token','none',{
        expires : new Date(Date.now() + 10 * 1000),
        httpOnly : true
    }) 

    res.status(200).json({
        success : true,
         data : {}
    })
})


//@desc get login user
//@routes get/api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success : true,
         data : user
    })
})

//@desc PUT Update User
//@routes PUT/api/v1/auth/updatedetails
//@access Private
exports.updateDetails = asyncHandler(async (req,res,next) => {
    const fieldstoupdate = {
        name : req.body.name,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,fieldstoupdate,{
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success : true,
         data : user
    })
})

//@desc Forget Password
//@routes POST/api/v1/auth/forgetpassword
//@access Public
exports.forgetPassord = asyncHandler(async (req,res,next) => {
    const user = await User.findOne({ email : req.body.email })

    if(!user){
        return next(new ErrorResponse('There is no user with this email',404));
    }


    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave : false})

    //create rset url 
    const reseturl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving the email because you (or someone eles) has requested the rest of password. Please make a PUT request to :\n\n ${reseturl}`;

    try{
        await sendEmail({
            email : user.email,
            subject : 'password reset',
            message
        })

        res.status(200).json({
            success : true,
            data : 'Email Sent'
        })
    }catch (err) {
        
        user.getResetPasswordToken = undefined;
        user.getResetPasswordExpire = undefined;

        await user.save({ validateBeforeSave : false })

        return next(new ErrorResponse('Email could not be sent',500))
    }

    res.status(200).json({
        success : true,
         data : user
    })
})

//@desc Reset Password
//@routes PUT/api/v1/auth/resetpassword/:resetpassword
//@access Public
exports.resetPassword = asyncHandler(async (req,res,next) => {

    //Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : { $gt : Date.now() }
    });

    if(!user){
        return next(new ErrorResponse('Invalid token',400));
    }

    user.password = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user , 200 , res);
})

//@desc Update Password
//@routes PUT/api/v1/auth/updatepassword
//@access Private
exports.updatePassword = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!await user.matchPassword(req.body.currentPassword)){
        return next(new ErrorResponse('Paasword is incorrect',401))
    }

    user.password = req.body.newPassword;
    await user.save();
    
    sendTokenResponse(user , 200 , res);
})

// Get token from the model, create cookie and send response
const sendTokenResponse = (user, statuscode , res) => {
    
    //create token
    const token = user.getSignedJwtToken()

    const options = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60* 60 * 100),
        httpOnly : true
    };

    if(process.env.NODE === 'production'){
        options.secure = true
    }

    res
        .status(statuscode)
        .cookie('token',token,options)
        .json({
            success : true,
            token
        })
}
