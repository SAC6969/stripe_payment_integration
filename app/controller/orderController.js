const express = require("express");
const passport = require("passport");
const router = express.Router();
const {swagger} = require('../config/swagger/swagger');
const {ordersByuser} = require('../services/orderService');

swagger({
    api: "/order/",
    summary: "orders",
    tags: "ORDER BY USER",
    method: "get",
});

router.get('/',passport.checkAuthentication,function(req,res){
    let response = { success: false, message: '',data: {}};
    try{
        ordersByuser(req.user,(error,data)=>{
            if(err){
                response.message = error
                return res.status(400).json(response);
            }
            response.message = result;
            response.success = true;
            return res.status(201).json(response);
        })
        res.status(200).json(response);
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
});

module.exports = router;