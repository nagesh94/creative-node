const express = require('express')
const cors=require('cors')
const userRoute=require('./routes/userRoute.js')
const taskRoute=require('./routes/taskRoute.js')



const app = express()
app.use(express.json())
app.use(cors())


app.use('/api/v1/users',userRoute)
app.use('/api/v1/tasks',taskRoute)

app.use((err,req,res,next)=>{
    
    err.status=err.status || "failure"
    err.statusCode=err.statusCode || 500
 
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        error:err,
        stack:err.stack
    })
 
    next();
    
 })


module.exports =app