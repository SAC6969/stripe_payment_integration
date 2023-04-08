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
        ordersByuser(req.user.id,(error,data)=>{
            if(error){
                response.message = `Error While Fetching Orders`;
                return res.status(400).json(response);
            }
            response.message = 'Fetched all order';
            response.success = true;
            response.data = data;
            return res.status(200).json(response);
        })
    }catch(error){
        response.message = `Error While Fetching Orders`;
        return res.status(400).json(response);
    }
});

module.exports = router;