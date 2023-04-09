const {usersOrder,sequelize} = require('../config/sequelize');
const { Sequelize } = require('sequelize');

const ordersByuser = async (userId) =>{
    let transaction = await sequelize.transaction();
    try{
        const orders = await usersOrder.findAll({
            where:{userId:userId},
            raw: true,
            transaction
        });
        await transaction.commit();
        return orders;
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    ordersByuser
}