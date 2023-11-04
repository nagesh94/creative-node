const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const validator=require('validator');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],

    },
    email:{
        type:String,
        unique:[true,"email already exist"],
        required:[true,"email is required"],
        lowercase:true,
        validate:[validator.isEmail,"please provide valid email"]
    },
    password:{
        type:String,
        required:[true,"password is required"],
        select:false
    },
    image:{
        type:String
    }
})

userSchema.pre('save',async function(next){
    this.password = await bcrypt.hash(this.password,12)
    next()
})

userSchema.methods.passcheck=async (candidatePass,userPass)=>{
    return  await bcrypt.compare(candidatePass,userPass)
}

module.exports=mongoose.model('User', userSchema)