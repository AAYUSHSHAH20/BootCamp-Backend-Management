const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

//Load env
dotenv.config({ path : './config/config.env'})

//Load Model
const Bootcamp = require('./models/Bootcamps')
const Course = require('./models/Course')
const User = require('./models/User')
const Reviews = require('./models/Reveiws')

mongoose.connect(process.env.MONGO_URI , {})

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')); 

const importdata = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Reviews.create(reviews)
        console.log('Data Created...')
        process.exit()
    }
    catch (err) {
        console.log(err)
    }
}

const deletedata = async () => {
    try{
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Reviews.deleteMany();
        console.log('Data Destoryed...');
        process.exit();
    }
    catch (err){
        console.log(err)
    }
}

if(process.argv[2] === "-i"){
    importdata();
}else if(process.argv[2] === "-d"){
    deletedata();
}