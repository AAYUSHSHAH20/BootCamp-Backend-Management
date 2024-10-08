const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../ulits/geocoder')
const Course = require('../models/Course');

const BootcampSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name'],
        unique : true,
        trim : true,
        maxlength : [50 , 'Name cannot be more than 50']
    },
    slug : String,
    description : {
        type : String,
        required : [true, 'Please add a description'],
        maxlength : [500 , 'description cannot be more than 500']
    },
    website : {
        type : String,
        match : [/^(https?:\/\/)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/[^\s]*)?$/, 'Please enter correct url']
    },
    phone : {
        type : String,
        maxlength : [20, 'Number can not be more then 20']
    },
    email : {
        type : String,
        match : [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter correct email']
    },
    address : {
        type: String,
        required : [true, 'Please add a address'],
    },
    location : {
        type : {
            type :String,
        enum : ['Point'],
        required : false
        },
        coordinates : 
        {
            type : [Number],
            required : false,
            index : '2dsphere'
        },
        formattedAddress : String,
        street : String,
        city : String,
        state : String,
        zipcode : String,
        country : String
         
    },
    careers : {
        type : [String],
        required : true,
        enum : [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating : {
        type : Number,
        min : [1 , 'Rating must be at least 1'],
        max : [10, 'Rating must be max to 10']
    },
    averageCost : Number,
    photo : {
        type : String,
        default : 'no-photo.jpg'
    },
    housing : {
        type: Boolean,
        default : false
    },
    jobAssistance : {
        type : Boolean,
        default : false
    },
    jobGuarantee : {
        type : Boolean,
        default : false
    },
    acceptGi : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now

    }, 
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        require : true
    }
},
    {
        toJSON : {virtuals : true},
        toObject : {virtuals : true}
    })

    BootcampSchema.pre('save' , function(next) {
    this.slug = slugify(this.name , {lower : true});
    next();
        })

BootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    
    this.location = {
        type : 'Point',
        coordinates : [loc[0].longitude , loc[0].latitude],
        formattedAddress : loc[0].formattedAddress,
        street : loc[0].streetName,
        city : loc[0].city,
        zipcode : loc[0].zipcode,
        country : loc[0].countryCode
    }
    this.address = undefined;
    next();
})

BootcampSchema.post('deleteOne', async function (result, next) {
    try {
        const filter = this.getFilter(); // Get the filter object used in the deleteOne operation
        const bootcampId = filter._id;
        if (bootcampId) {
            const deletedCourses = await Course.deleteMany({ bootcamp: bootcampId });
        }
        next();
    } catch (error) {
        console.error("Error during cascade delete:", error);
        next(error);
    }
});



//reverse populate with virtuals
BootcampSchema.virtual('courses' , {
    ref : 'Course',
    localField : '_id',
    foreignField : 'bootcamp',
    justOne : false
})


module.exports = mongoose.model('Bootcamp', BootcampSchema);