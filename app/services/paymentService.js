const {usersOrder,sequelize} = require('../config/sequelize');
const generateUUID = require('../utilities/uuidGenerator');
const { Sequelize } = require('sequelize');
const stripe = require('stripe')('sk_test_51MtSsyKBdede7ICMDQjezTCWEWABPpLQ9sd9CzsHFueRygh2IOKw84JULyb2GDAPlCOFtsozOLbMgrZKNArQB7Q900kdKLykPY');


const stripeSessionUrl = async (data,userId) => {
    try{
        console.log(userId);
        const customer = await stripe.customers.create({
            metadata:{
                userId: userId,
                cart: JSON.stringify(data)
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                currency: 'usd',
                product_data: {
                    name: data.name,
                },
                unit_amount: data.price,
                },
                quantity: data.quantity,
            }],
            mode: 'payment',
            customer: customer.id,
            success_url: `${process.env.SERVER_URL}/payment/success`,
            cancel_url: process.env.SERVER_URL,
        });

        return session;
    }catch(error){
        return error;
    }
}

// stripe webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret = "whsec_20c49557d5c91d97f9c3701037789e6af094929fd3de9013a6927dc3060e89bb";

const stripeWebhook = async (req) =>{
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
                return err;
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
                return err;
            })
        }
    }catch(error){
        return error;
    }
}

const createOrder = async (customer,data) => {
    let transaction;
    try{
        transaction = await sequelize.transaction();
        
        const Items = JSON.parse(customer.metadata.cart);

        const newOrder = {
            userId:customer.metadata.userId,
            customerID:data.customer,
            paymentIntentId:data.payment_intent,
            product:Items,
            subtotal:data.amount_subtotal,
            total:data.amount_total,
            delivery_status:"pending",
            payment_status:data.payment_status,
        }
        newOrder.id = generateUUID.uuid();

        await usersOrder.create(newOrder,{transaction});
        await transaction.commit(); 
        console.log('Payment Order Done');
    }catch(error){
        console.log("Order Payment not done");
        await transaction.rollback();
    }
}

module.exports = {
    createOrder,
    stripeSessionUrl,
    stripeWebhook
}