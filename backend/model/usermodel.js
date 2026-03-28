import mongoose from "mongoose"
const userSchema=new mongoose.Schema({
    userquery:{
        type:String,
        required:true,        
    },
    usercontext:{
        type:String,
        required:true,
    }
   
})
const User=mongoose.model("User",userSchema)
export default User