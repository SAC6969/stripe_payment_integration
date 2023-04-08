const {usersOrder} = require('../config/sequelize');
const { Sequelize } = require('sequelize');

const ordersByuser = async (userId,cb) =>{
    try{
        const orders = await usersOrder.findAll({
            where:{userId:userId},
            raw: true
        });
        return cb(null,orders)
    }catch(error){
        return cb(error.message);
    }
}

module.exports = {
    ordersByuser
}