const express = require('express');
const { GetReviews,GetReview,addReview,updateReview,deleteReview }  = require('../controllers/reviews')

const advanceResults = require('../middleware/advanceResults')
const { protect,authorize } = require('../middleware/auth');
const Review = require('../models/Reveiws');
const routes = express.Router({ mergeParams : true})

routes.route('/').get(advanceResults(Review, {path : 'bootcamp',select : 'name text'}),GetReviews).post(protect,authorize('user','admin'),addReview)

routes.route('/:id').get(GetReview).put(protect,authorize('user','admin'),updateReview).delete(protect,authorize('user','admin'),deleteReview);

module.exports = routes