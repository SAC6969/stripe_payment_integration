module.exports = (sequelize,type) => {
    return sequelize.define('users',{
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        fullName: {
            type: type.STRING,
            allowNull: false
        },
        email: {
            type: type.STRING,
            validate: {
                isEmail: true,
            },
            allowNull: false
        },
        phone: {
            type: type.STRING(20),
            allowNull: false
        },
        password: {
            type: type.STRING,
        },
        is_active: {
            type: type.BOOLEAN,
            defaultValue: true,
            validate: {
                isIn: [[true, false]],
            },
        },
        is_removed: {
            type: type.BOOLEAN,
            defaultValue: false,
            validate: {
                isIn: [[true, false]],
            },
        },
    },{
        timestamps: true,
    })
}