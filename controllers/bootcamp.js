const Bootcamp = require('../models/Bootcamps')
const Course = require('../models/Course')
const ErrorResponse = require('../ulits/errorresponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../ulits/geocoder')
const path = require('path')


//@desc Get all bootcamps
//@routes GET/api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    console.log(res.advanceResults)
    res.status(200).json(res.advanceResults);
});


//@desc Get single bootcamps
//@routes GET/api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler( async (req,res,next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if(!bootcamp)
        {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }
        res.status(201).json({
            success : true,
            data : bootcamp
        })
    
})

//@desc create bootcamps
//@routes POST/api/v1/bootcamps
//@access Public
exports.createBootcamp = asyncHandler( async (req,res,next) => {
    //Add user to req.body
    req.body.user =req.user.id;

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user : req.user.id })

    // If user is no an admin, they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`,400))
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success : true,
        data : bootcamp
    })
})

//@desc update bootcamp
//@routes PUT/api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
   
        let bootcamp = await Bootcamp.findById(req.params.id)

        if (!bootcamp) {
            return res.status(400).json({
                success: false,
                message: "Bootcamp not found"
            });
        }
        
        //Make sure if user is the bootcamo owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`USer ${req.params.id} is not authorized to update this bootcamp.`,401)
            )
        }

        bootcamp = await Bootcamp.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        })
    

        res.status(200).json({
            success: true,
            data: bootcamp
        });
   
})

//@desc delete bootcamps
//@routes DELETE/api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        //Make sure if user is the bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`USer ${req.params.id} is not authorized to delete this bootcamp.`,401)
            )
        }

        // Delete the bootcamp
        await bootcamp.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(error); // Log the error to console for debugging purposes
        return next(new ErrorResponse("Server Error", 500));
    }
});




//@routes PUT/api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampInRadius = asyncHandler( async (req, res, next) => {
    const {zipcode , distance} = req.params;
    
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lon = loc[0].longitude;

    const radius = distance/3963;

    const bootcamps = await Bootcamp.find({ 
        location : { $geoWithin : { $centerSphere : [[lon,lat] , radius] } }
    })

    res.status(200).json({
        status : true,
        count : bootcamps.length,
        data : bootcamps

    })
})


//@desc upload image file
//@routes DELETE/api/v1/bootcamps/:id/photos
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }
        //Make sure if user is the bootcamo owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`USer ${req.params.id} is not authorized to update this bootcamp.`,401)
            )
        }

        if(!req.files){
            return next(new ErrorResponse(`Please Upload a file`, 404));
        }

        const file = req.files.file;

        if(!file.mimetype.startsWith('image')){
            return next(new ErrorResponse(`Please Upload a file`, 404));
        }
        
        if(file.size > process.env.MAX_FILE_UPLOAD){
            return next(new ErrorResponse(`Please Upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
        }

        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if(err) {
                console.log(err)
                return next(new ErrorResponse(`Problem with file upload`, 500)); 
            }
            await Bootcamp.findByIdAndUpdate(req.params.id , {photo : file.name})

            res.status(200).json({
                success : true,
                data : file.name
            })
        })
});
