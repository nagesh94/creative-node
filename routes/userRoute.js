const express = require('express');
const { register, getUsers, login, getSingleUser, authorization, uploadUserImage } = require('../controllers/userController');

const router=express.Router()

router
.route('/register')
.post(uploadUserImage,register)

router
.route('/login')
.post(login)

router
.route('/')
.get(getUsers)
router
.route('/:id')
.get(getSingleUser)


module.exports=router