const express = require("express");
const passport = require("passport");
const router = express.Router();
const {swagger} = require('../config/swagger/swagger');
const {register,login} = require('../services/authService');
const regexEmail = require('../utilities/regexEmail');

swagger({
    api: "/auth/",
    summary: "Checking the routes",
    tags: "AUTH",
    method: "get",
});

router.get('/',passport.checkAuthentication,function(req,res){
    res.status(200).json({message:"hello"});
});

swagger({
    api: "/auth/register",
    summary: "Register Api",
    tags: "AUTH",
    fields: [
        "fullName",
        "email",
        "phone",
        "password"
    ]
});

router.post('/register',function(req,res){
    let response = { success: false, message: '',data: {}};
    try{
        console.log("sasasasa")
        let data = req.body
        if(!data.fullName || !data.email || !data.phone || !data.password){
            throw new Error("Enter all the details");
        }
        register(req.body,(error,result)=>{
            if(error){
                response.message = error
                return res.status(400).json(response);
            }
            response.message = result;
            response.success = true;
            return res.status(201).json(response);
        })
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})

swagger({
    api: "/auth/login",
    summary: "Register Api",
    tags: "AUTH",
    fields: [
        "userId",
        "password",
    ]
});

router.post('/login',function(req,res){
    let response = { success: false, message: '', data: {}};
    try{
        let data = req.body
        if(!data.userId || !data.password){
            throw new Error('Enter all the details');
        }

        if(data.userId.match(regexEmail)){
            data.email = data.userId;
        }else if(!isNaN(data.userId) && data.userId.length === 10){
            data.phone = data.userId
        }else{
            throw new Error('Enter valid details');            
        }

        login(data,(error,result)=>{
            if(error){
                response.message = error
                return res.status(400).json(response);
            }
            response.message = result.message;
            response.data = result.data;
            response.success = true;
            return res.status(201).json(response);
        })
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})


module.exports = router;