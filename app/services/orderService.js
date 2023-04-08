const {usersOrder,sequelize} = require('../config/sequelize');
const { Sequelize } = require('sequelize');

const ordersByuser = async (userId,cb) =>{
    let transaction;
    try{
        transaction = await sequelize.transaction();
        const orders = await usersOrder.findAll({
            where:{userId:userId},
            raw: true
        },transaction);

        return cb(null,orders)
    }catch(error){
        await transaction.rollback();
        return cb(error.message);
    }
}

module.exports = {
    ordersByuser
}