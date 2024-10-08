const express = require('express');
const routes = express.Router({ mergeParams : true})
const { 
    GetCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courses")

const Courses = require('../models/Course')

const advanceResults = require('../middleware/advanceResults')

const { protect,authorize } = require('../middleware/auth')

routes.route('/:id').get(getCourse).put(protect,authorize('publisher','admin'),updateCourse).delete(protect,authorize('publisher','admin'), deleteCourse);

routes.route('/').get(advanceResults(Courses,{
    path : 'bootcamp',
    select : 'name description'
}),GetCourses).post(protect,addCourse);

module.exports = routes;