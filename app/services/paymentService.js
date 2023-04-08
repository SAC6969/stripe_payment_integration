const {usersOrder,sequelize} = require('../config/sequelize');
const generateUUID = require('../utilities/uuidGenerator');
const { Sequelize } = require('sequelize');


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
        console.log('Payment Order Done')
    }catch(error){
        console.log("Order Payment not done");
        await transaction.rollback(); 
    }
}

module.exports = {
    createOrder
}