const express = require("express");
const passport = require("passport");
const router = express.Router();
const {swagger} = require('../config/swagger/swagger');
const {login, createOrder} = require('../services/paymentService');
const axios = require("axios");
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
    summary: "Register Api",
    tags: "STRIPE PAYMENT",
});

router.post('/create-checkout-session',passport.checkAuthentication,async function(req,res){
    let response = { success: false, message: '',data: {}};
    try{
        console.log("req.user",req.user.id);
        const customer = await stripe.customers.create({
            metadata:{
                userId: req.user.id,
                cart: JSON.stringify(req.body)
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                currency: 'usd',
                product_data: {
                    name: req.body.name,
                },
                unit_amount: req.body.price,
                },
                quantity: req.body.quantity,
            }],
            mode: 'payment',
            customer: customer.id,
            success_url: `${process.env.SERVER_URL}/payment/success`,
            cancel_url: process.env.SERVER_URL,
        });

        response.success = true
        response.message = "URL created";
        response.data = session.url
        return res.status(201).json(response);
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})

// stripe webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret = "whsec_20c49557d5c91d97f9c3701037789e6af094929fd3de9013a6927dc3060e89bb";

swagger({
    api: "/payment/webhook",
    summary: "webhook Api",
    tags: "STRIPE PAYMENT",
});

router.post('/webhook', (req, res) => {
  try{
    const sig = req.headers['stripe-signature'];

    let data;
    let eventType;

    if(endpointSecret){
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log("webhook verified.");
        } catch (err) {
            console.log(`webhook err.${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        data = event.data.object;
        eventType = event.type;
    }else{
        data = req.body.data.object;
        eventType = req.body.type;
    }

    // Handle the event
    if(eventType === "checkout.session.completed"){
        stripe.customers
        .retrieve(data.customer)
        .then((customer)=>{
            createOrder(customer,data);
        }).catch(err=>{
            return res.status(400).send(`Webhook Error: ${err.message}`);
        })
    }
    res.send().end();
  }catch(error){
    console.log(`error in webhook ${error}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

swagger({
    api: "/payment/refund/{id}",
    summary: "Register Api",
    tags: "AUTH",
    fields: [
        "userId",
        "password",
    ]
});

router.post('/refund/:id',async function(req,res){
    let response = { success: false, message: '', data: {}};
    try{
        const paymentIntentId = 'pi_XXXXXXXXXXXXXXXXXXXXXXXX';
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Create Refund
        const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: paymentIntent.amount,
        reason: 'requested_by_customer'
        });

        console.log(refund);    
    }catch(error){
        response.message = error.message;
        return res.status(400).json(response);
    }
})


module.exports = router;