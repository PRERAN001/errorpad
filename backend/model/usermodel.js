import mongoose from "mongoose"
const userSchema=new mongoose.Schema({
    userquery:{
        type:String,
        required:true,        
    },
    usercontext:{
        type:String,
        required:false,
    }
   ,isProtected:{
        type:Boolean,
        default:false,
    }
   ,passwordHash:{
        type:String,
        default:"",
    }
   
})
const User=mongoose.model("User",userSchema)
export default User