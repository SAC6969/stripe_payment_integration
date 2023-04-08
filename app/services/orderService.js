const {usersOrder,sequelize} = require('../config/sequelize');
const { Sequelize } = require('sequelize');

const ordersByuser = async () =>{
    let transaction;
    try{
        transaction = await sequelize.transaction();
        
    }catch(error){
        await transaction.rollback(); 
        if (error instanceof Sequelize.ValidationError) {
            return cb("Enter valid details");
        } else {
            return cb(error.message);
        }
    }
}

module.exports = {
    ordersByuser
}