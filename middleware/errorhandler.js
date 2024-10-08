const errorresponse = require('../ulits/errorresponse')
const errorhandler = (err, req, res, next) => {
    
    let error = {...err}
    error.message = err.message
    
    //Mongoose Bad Error
    if(err.name === "CastError"){
        const message = `Resources not found`
        error = new errorresponse(message , 404)
    }

    //Mongoose Duplicate Error
    if(err.code == 11000){
        const message = `Duplicate field value entered`
        error = new errorresponse(message , 400)
    }

    //Mongoose Validation Error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new errorresponse(message , 400);
    }

    res.status( error.statusCode  || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorhandler