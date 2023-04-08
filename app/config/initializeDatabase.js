const { Sequelize, Model } = require("sequelize")
const {DATABASE_NAME,DIALECT,HOST,USER_NAME,PASSWORD} = require('./databaseConnection')

const sequelize = new Sequelize(DATABASE_NAME, USER_NAME, PASSWORD, {
    host: HOST,
    dialect: DIALECT,
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});

module.exports = sequelize;