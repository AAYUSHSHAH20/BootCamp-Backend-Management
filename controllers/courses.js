const Bootcamp = require('../models/Bootcamps')
const ErrorResponse = require('../ulits/errorresponse')
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');



//@desc Get all courses
//@routes GET/api/v1/course
//@routes GET/api/v1/bootcamps/:bootcamps/courses
//@access Public

exports.GetCourses = asyncHandler( async (req,res,next) => {
    
        if(req.params.bootcampId) {
            const courses = await Course.find({ bootcamp : req.params.bootcampId });

            return res.send(200).json({
                success : true,
                count : courses.length,
                data : courses
            });
        }
        else {
           res.status(200).json(res.advanceResults);
        }
} )

//@desc Get single course
//@routes GET/api/v1/courses/:id
//@access Public

exports.getCourse = asyncHandler( async (req,res,next) => {
    
    const course = await Course.findById(req.params.id).populate({
        path : 'bootcamp',
        select : 'name description'
    })

    if(!course){
        return next(new ErrorResponse(`No Course of id of ${req.params.id}`),404)
    }

    res.status(200).json({
        success : true,
        data : course
    })
} )

//@desc add a course
//@routes GET/api/v1/courses/:bootcampId
//@access Private

exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcampId = req.params.bootcampId; // Extracting bootcampId from the request parameters

    const bootcamp = await Bootcamp.findById(bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found of the id ${bootcampId}`), 404);
    }

    console.log(bootcamp)
    //Make sure if user is the bootcamo owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}.`,401)
        )
    }

    const course = await Course.create({ ...req.body, bootcamp: bootcampId });

    res.status(200).json({
        success: true,
        data: course
    });
});


//@desc update a course
//@routes PUT/api/v1/courses/:id
//@access Private

exports.updateCourse = asyncHandler( async (req,res,next) => {
    
    let course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`course not found of the id ${req.params.id}`),404)
    }

    //Make sure if user is the course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update a course to bootcamp ${course._id}.`,401)
        )
    }

    course = await Course.findByIdAndUpdate(req.params.id , req.body , {
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success : true,
        data : course
    })
} )

//@desc delete a course
//@routes DELETE/api/v1/courses/:id
//@access Private

exports.deleteCourse = asyncHandler( async (req,res,next) => {
    
    let course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`course not found of the id ${req.params.id}`),404)
    }

    //Make sure if user is the course owner
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to delete a course to bootcamp ${course._id}.`,401)
            )
        }

    await course.deleteOne();

    res.status(200).json({
        success : true,
        data : {}
    })
} )