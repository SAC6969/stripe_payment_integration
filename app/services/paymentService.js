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
        throw error;
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
        throw error;
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
        throw error;
    }
}

const refundPayment = async (paymentId,cb) => {
    const transaction = await sequelize.transaction();
    try{
        const paymentIntentId = paymentId;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: paymentIntent.amount,
            reason: 'requested_by_customer'
        });

        const result = await usersOrder.update(
            { refundIntentId : refund.id},
            { where: { paymentIntentId } },
            transaction
        );
      
        await transaction.commit();
        return cb(null,refund);
    }catch(error){
        console.error(error);
        await transaction.rollback();
        return cb('Error already been refunded');
    }
}

const transferPayment = async (paymentId,cb) => {
    const transaction = await sequelize.transaction();
    try{
        console.log(paymentId,"$$$");
        const paymentIntentId = paymentId;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const transfer = await stripe.transfers.create({
            amount: paymentIntent.amount, // Amount in cents
            currency: paymentIntent.currency,
            destination: 'acct_1MvH4iGh4ZXom1Fu',
            transfer_group: paymentIntent.id
        });
        
        // const updatedPaymentIntent = await stripe.paymentIntents.update(
        //     paymentIntent.id,{
        //       status: transfer.status === 'succeeded' ? 'succeeded' : 'failed',
        //     }
        // );
        // console.log(transfer);
        // console.log("##333w",updatedPaymentIntent);

        await transaction.commit();
        return cb(null,transfer.id);
    }catch(error){
        console.error(error);
        await transaction.rollback();
        return cb('Error while sending to provider');
    }
}

module.exports = {
    createOrder,
    stripeSessionUrl,
    stripeWebhook,
    refundPayment,
    transferPayment
}