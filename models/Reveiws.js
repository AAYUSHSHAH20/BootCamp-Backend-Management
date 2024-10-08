const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title : {
        type : String,
        trim :true,
        required : [true , 'Please add a title for the review.'],
        maxlength : 1000
    },
    text : {
        type : String,
        required : [true , 'Please add description']
    },
    rating : {
        type : Number,
        min : 1,
        max : 10,
        required : [true , 'Please add a rating between 1 to 10.'],
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    bootcamp : {
        type : mongoose.Schema.ObjectId,
        ref : 'Bootcamp',
        require : true
    }, 
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        require : true
    }
})

//Prevent user from adding more then 1 review per bootcamp
ReviewSchema.index({bootcamp : 1 , user : 1},{unique : 1});

// Static method to get avg of rating
ReviewSchema.statics.getAverageRating = async function(bootcampId){
    const obj = await this.aggregate([
        {
            $match : { bootcamp : bootcampId}
        },
        {
            $group : {
                _id : '$bootcamp',
                averageRating : { $avg : '$rating '}
            }
        }
    ])    
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId , {
            averageRating :obj[0].averageRating
        })
    }
    catch (err){
        console.log(err)
    }
}

ReviewSchema.post('save', async function () {
    await mongoose.model('Review').getAverageRating(this.bootcamp);
});

ReviewSchema.pre('deleteOne', async function () {
    await mongoose.model('Review').getAverageRating(this.bootcamp);
});


module.exports = mongoose.model('Review', ReviewSchema);
