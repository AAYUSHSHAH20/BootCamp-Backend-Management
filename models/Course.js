const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title : {
        type : String,
        trim :true,
        required : [true , 'Please add a course title']
    },
    description : {
        type : String,
        required : [true , 'Please add description']
    },
    weeks : {
        type : String,
        required : [true , 'Please add number of weeks']
    },
    tuition : {
        type : Number,
        required : [true , 'Please add a tuition cost']        
    },
    minimumSkill : {
        type : String,
        required : [true , 'Please add a minium skill'],
        enum : ['beginner', 'intermediate','advanced']
    },
    scholarshipAvailable:{
        type : Boolean,
        default : false
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

// Static method to get avg of course tution
CourseSchema.statics.getAverageCost = async function(bootcampId){
    const obj = await this.aggregate([
        {
            $match : { bootcamp : bootcampId}
        },
        {
            $group : {
                _id : '$bootcamp',
                averageCost : { $avg : '$tuition'}
            }
        }
    ])    
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId , {
            averageCost : Math.ceil(obj[0].averageCost / 10) * 10  
        })
    }
    catch (err){
        console.log(err)
    }
}

//call getAverageCost after save
CourseSchema.post('save', function(){
        this.constructor.getAverageCost(this.bootcamp)
})

//call getAverageCost before reomve
CourseSchema.pre('deleteOne',function(){
    this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course', CourseSchema);
