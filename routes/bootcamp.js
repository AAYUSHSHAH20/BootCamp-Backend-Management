const express = require('express');
const routes = express.Router()
const {getBootcamps,getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require("../controllers/bootcamp")

const { protect,authorize } = require('../middleware/auth')

const Bootcamp = require('../models/Bootcamps')

const advanceResult = require('../middleware/advanceResults')

//Include other resources routers
const coursesRouter = require('./courses')
const reviewRouter = require('./reviews')

//Re-route in to other resources router 
routes.use('/:bootcampId/courses',coursesRouter);
routes.use('/:bootcampId/reviews',reviewRouter);

routes.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

routes.route('/')
.get(advanceResult(Bootcamp,'courses'),getBootcamps)
.post(protect,authorize('publisher','admin'), createBootcamp)

routes.route('/:id').get(getBootcamp).put(protect,authorize('publisher','admin'),updateBootcamp).delete(protect,authorize('publisher','admin'),deleteBootcamp)

routes.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload )

module.exports = routes