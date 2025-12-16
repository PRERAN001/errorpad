const mongoose=require("mongoose")
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
module.exports=User