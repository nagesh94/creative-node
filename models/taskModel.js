const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'title is required']
    },
    due_date:{
        type:Date,
        required:[true,'due date is required']
    },
    attachment:{
        type:String,

    },
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:[true,'user is required']
    }
})

taskSchema.pre(/^find/,function(next){
    this.populate({
        path:'user'
    })
    next()
})


module.exports =mongoose.model('Tasks',taskSchema)