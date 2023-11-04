const Tasks=require('../models/taskModel')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer');
const fs = require('fs');


const multerStorage=multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'taskattachments')
    },
    filename: (req,file,cb)=>{
        const ext=file.mimetype.split('/')[1]
        cb(null,`user-${req.currentUser._id}.${ext}`)
    }
})

const upload=multer({
    storage:multerStorage
})

exports.uploadTaskAttachment=upload.single('attachment')




exports.getAlltask=catchAsync(async (req,res,next)=>{
    const userId=req.currentUser._id
    const userTasks=await Tasks.find({user:userId})
    res.status(200).json({
        status:"success",
        result:userTasks
    })

})

exports.createTask=catchAsync(async (req,res,next) => {
    const userId=req.currentUser._id
    let attachmentReceived=""
    if(req.file) attachmentReceived=req.file.filename

    const dateObject = new Date(req.body.due_date);
   
    let data={
        title:req.body.title,
        due_date:dateObject,
        user:userId,
        attachment:attachmentReceived
    }

    const result=await Tasks.create(data)
    res.status(200).json({
        status:"success",
        result
    })

})

exports.updateTask=catchAsync(async (req,res,next)=>{
    const id =req.params.id
    console.log(req.body)
    const data=await Tasks.findByIdAndUpdate(id,req.body,{
        new:true
    })

    res.status(200).json({
        status:"success",
        result:data
    })

})
exports.deleteTask=catchAsync(async (req,res,next)=>{
    const id=req.params.id
    const result=await Tasks.findOneAndDelete(id)
    res.status(202).json({status:"success"})
})