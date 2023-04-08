const {Sequelize} = require('sequelize');
const sequelize = require('../config/initializeDatabase');


const usersModel = require('../models/users');
const usersOrderModel = require('../models/users_order');

const users = usersModel(sequelize,Sequelize);
const usersOrder = usersOrderModel(sequelize,Sequelize);

// users.hasMa?ny(groupRoles, { foreignKey: "group_id", onDelete: "cascade" });
users.hasMany(usersOrder,{foreignKey:"userId"})
usersOrder.belongsTo(users, { foreignKey: "userId"});

sequelize
.sync({
    force: false,
    // alter : true
})
.then(() => {
    console.log(`Database & tables created here!`);
})
.catch((err) => {
    console.log("Error------", err);
});

module.exports = {
    sequelize,
    users,
    usersOrder
}
