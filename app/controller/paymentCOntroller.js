const express = require("express");
const passport = require("passport");
const router = express.Router();
const {swagger} = require('../config/swagger/swagger');
const { stripeSessionUrl,stripeWebhook,refundPayment,transferPayment} = require('../services/paymentService');
require('dotenv').config();
const stripe = require('stripe')('sk_test_51MtSsyKBdede7ICMDQjezTCWEWABPpLQ9sd9CzsHFueRygh2IOKw84JULyb2GDAPlCOFtsozOLbMgrZKNArQB7Q900kdKLykPY');

swagger({
    api: "/payment/",
    summary: "Checking the routes",
    tags: "STRIPE PAYMENT",
    method: "get",
});

router.get('/',passport.checkAuthentication,function(req,res){
    res.status(200).json({message:"hello"});
});

swagger({
    api: "/payment/create-checkout-session",
    summary: "createing checkout session for the order",
    tags: "STRIPE PAYMENT",
    fields: [
        "name",
        "price",
        "quantity"
    ]
});

router.post('/create-checkout-session',passport.checkAuthentication,async function(req,res){
    let response = { success: false, message: '',data: {}};
    try{
        const userId = req.user.id;
        const data = req.body;
        const sessionUrl = await stripeSessionUrl(data,userId);
        
        response.success = true;
        response.message = "URL created";
        response.data = sessionUrl.url;
        return res.status(201).json(response);
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})

swagger({
    api: "/payment/webhook",
    summary: "webhook Api",
    tags: "STRIPE PAYMENT",
});

router.post('/webhook', async (req, res) => {
  try{
    await stripeWebhook(req);
    res.send().end();
  }catch(error){
    console.log(`error in webhook ${error}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

swagger({
    api: "/payment/refund/{id}",
    summary: "Refund of the order by id",
    tags: "STRIPE PAYMENT",
    fields: [
        "userId",
        "password",
    ]
});

router.post('/refund/:id',async function(req,res){
    let response = { success: false, message: '', data: {}};
    try{
        const paymentId = req.params.id
        
        refundPayment(paymentId,(err,data)=>{
            if(err){
                response.message = err;
                return res.status(400).json(response);
            }
            response.success = true;
            response.message = "refunded successfully";
            return res.status(200).json(response);
        });
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})


swagger({
    api: "/payment/transfer/{id}",
    summary: "transfer to the provider",
    tags: "STRIPE PAYMENT",
    // fields: []
});

router.post('/transfer/:id',async function(req,res){
    let response = { success: false, message: '', data: {}};
    try{
        const paymentId = req.params.id
        console.log(paymentId,"######3")
        transferPayment(paymentId,(err,data)=>{
            if(err){
                response.message = err;
                return res.status(400).json(response);
            }
            console.log(data);
            response.success = true;
            response.message = "Transfer successfully";
            return res.status(200).json(response);
        });
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})


module.exports = router;