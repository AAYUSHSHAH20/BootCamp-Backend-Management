const express = require('express')

const { getUser,getUsers,createUser,deleteUser,updateUser } = require('../controllers/user')


const Users = require('../models/User')

const advanceResults = require('../middleware/advanceResults')
const { protect,authorize } = require('../middleware/auth')
const router = require('./auth')

router.use(protect);
router.use(authorize('admin'));


router.route('/').get(advanceResults(Users),getUsers).post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router