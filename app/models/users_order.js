module.exports = (sequelize,type) => {
    return sequelize.define('usersOrder',{
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            type: type.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate:'CASCADE',
            onDelete: 'CASCADE'
        },
        customerID: {
            type: type.STRING,
            allowNull: false,
        },
        paymentIntentId: {
            type: type.STRING,
            allowNull: false,
        },
        refundIntentId: {
            type: type.STRING,
            allowNull: true,
        },
        product: {
            type: type.JSON,
            allowNull: false,
        },
        subtotal: {
            type: type.FLOAT,
            allowNull: false,
        },
        total: {
            type: type.FLOAT,
            allowNull: false,
        },
        delivery_status: {
            type: type.ENUM('pending', 'shipped', 'delivered'),
            defaultValue: 'pending',
            allowNull: false,
        },
        payment_status: {
            type: type.ENUM('pending', 'paid', 'failed'),
            defaultValue: 'pending',
            allowNull: false,
        },
    },{
        timestamps: true,
    })
}