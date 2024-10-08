const Bootcamp = require('../models/Bootcamps')
const ErrorResponse = require('../ulits/errorresponse')
const asyncHandler = require('../middleware/async');
const Review = require('../models/Reveiws');


//@desc Get all reviews
//@routes GET/api/v1/course
//@access Public

exports.GetReviews = asyncHandler( async (req,res,next) => {
        if(req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp : req.params.bootcampId });    
        
        return res.status(200).json({
            success : true,
            count : reviews.length,
            data : reviews
        });
    }
    else {
       res.status(200).json(res.advanceResults);
    }

})

//@desc Get Single review
//@routes GET/api/v1/reviews/:id
//@access Public

exports.GetReview = asyncHandler( async (req,res,next) => {
    const review = await Review.findById(req.params.id).populate({
        path : 'bootcamp',
        select : 'name description'
    })

    if(!review){
        return next(new ErrorResponse(`No review found with id of ${req.params.id}`,404));
    }

    res.status(200).json({
        success : true,
        data : review
    })
})

//@desc Add Review
//@routes POST/api/v1/bootcamps/:bootcampId/reviews
//@access Private

exports.addReview = asyncHandler( async (req,res,next) => {
    
    req.body.Bootcamp = req.body.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`no bootcamp of this id of ${req.params.bootcampId}`,404))
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success : true,
        data : review
    })
})

//@desc Update Review
//@routes PUT/api/v1/bootcamps/:bootcampId/reviews
//@access Private

exports.updateReview = asyncHandler( async (req,res,next) => {
    let review  = await Review.findById(req.params.id)

    if(!review) {
        return next(new ErrorResponse(`no review of id ${req.params.id}`,404))
    } 

    if(review.user.toString() !== req.user.id && req.user.role == 'admin'){
        return next(new ErrorResponse('Not authorize to access this route',401))
    }

     review = await Review.findByIdAndUpdate(req.params.id, req.body,{
        new : true,
        runValidators : true
     })

    res.status(201).json({
        success : true,
        data : review
    })
})

//@desc Delete Review
//@routes DELETE/api/v1/bootcamps/:bootcampId/reviews
//@access Private

exports.deleteReview = asyncHandler( async (req,res,next) => {
    let review  = await Review.findById(req.params.id)

    if(!review) {
        return next(new ErrorResponse(`no review of id ${req.params.id}`,404))
    } 

    if(review.user.toString() !== req.user.id && req.user.role == 'admin'){
        return next(new ErrorResponse('Not authorize to access this route',401))
    }

     await review.deleteOne();

    res.status(201).json({
        success : true,
        data : review
    })
})