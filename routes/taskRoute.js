const express = require('express')
const { getAlltask, createTask, uploadTaskAttachment, updateTask, deleteTask } = require('../controllers/taskController')
const { authorization } = require('../controllers/userController')

const router=express.Router()

router
.route('/')
.get(authorization,getAlltask)
router
.route('/:id')
.put(authorization,updateTask)
.delete(authorization,deleteTask)

router
.route('/create')
.get(authorization,uploadTaskAttachment,createTask)

module.exports = router