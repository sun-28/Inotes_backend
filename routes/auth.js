const express = require('express');
const User = require('../models/User');

const router = express.Router();
const {body , validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt  =  require('jsonwebtoken')
const JWT_SECRET= process.env.JWT_SECRET
const fetchUser= require('../Middleware/fetchUser')
// SignUp Endpoint 
try {
    router.post('/createuser',[
    body('name','Enter a valid name').isLength({min: 3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Enter a valid password').isLength({min: 6})
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success,error: errors.array()[0].msg});
    }
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.json({success,error :"please enter valid credentials"})
    }
    const salt= await bcrypt.genSalt(10);
    secpass = await bcrypt.hash(req.body.password,salt)
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
    })
    const data = {
        user:{
            id: user.id
        }
    }
const authtoken = jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken})
})
} catch (error) {
    console.log(error); 
    return res.send({success,error:"Error occured"}) 
}


// Login Endpoint
try {    
    router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot can be blank').isLength({min:1}),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success,error: errors.array()[0].msg});
    }
    const {email,password}=req.body
   let user = await User.findOne({email});
   if(!user){
    return res.json({success,error: "Invalid Credentials"})
}

const passwordCompare = await bcrypt.compare(password,user.password);

if(!passwordCompare){
       return res.json({success,error: "Invalid Credentials"})    
   }

   const data = {
        user:{
            id: user.id
        }
    }

const authtoken = jwt.sign(data,JWT_SECRET);
    success = true;
    res.json({success,authtoken})

})
} catch (error) {
    console.log(error); 
   return res.send({success,error:"Error occured"}) 
}


// getdata Endpoint


try {
    router.post('/getuser',fetchUser, async (req, res) =>{
        const userId = req.user.id
        const user = await User.findById(userId).select('-password');
        res.send(user);
    })
} catch (error) {
    console.log(error); 
    res.status(500).send({error:"Error occured"}) 
}





module.exports = router