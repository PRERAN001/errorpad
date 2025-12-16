const express = require('express');
const app = express();
const cors=require("cors")
app.use(cors());
const port = 3000;
app.use(express.json());
const mongoose=require("mongoose")
mongoose.connect('mongodb://127.0.0.1:27017/errorpad').then(()=>{
    console.log("Connected to MongoDB");
})
const User = require('./model/usermodel');
app.post('/:userquery', async (req, res) => {
    const userquery = req.params.userquery;
    const { usercontext } = req.body;

    
    const user = await User.findOneAndUpdate(
        { userquery: userquery }, 
        { usercontext: usercontext },
        { new: true, upsert: true } 
    );
    
    console.log("Updated user:", user);
    res.status(201).json(user);
});
app.get('/:userquery', async (req, res) => {
    const userquery=req.params.userquery;
    const user=await User.findOne({userquery});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    console.log("get",user);
    res.status(200).json(user);
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
