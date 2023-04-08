const {users,sequelize} = require('../config/sequelize');
const generateUUID = require('../utilities/uuidGenerator');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretOrKey = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_TOKEN_EXPIRY;

const register = async (data,cb) => {
    let transaction;
    try{
        transaction = await sequelize.transaction();
        
        await registerValidation(data,transaction);
        
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(data.password, salt);

        data.id = generateUUID.uuid();
        data.password = hash
        
        await users.create(data);
        await transaction.commit(); 
        return cb(null,"User Created Successfully");
    }catch(error){
        await transaction.rollback(); 
        if (error instanceof Sequelize.ValidationError) {
            return cb("Enter valid details");
        } else {
            return cb(error.message);
        }
    }
}

const registerValidation = async (data,transaction) => {
    const usersRes = await users.findOne({ where: { email: data.email }, transaction });
    if(usersRes){
        throw new Error('Email already exists');
    }

    if(data.phone.length !== 10 || isNaN(data.phone)){
        throw new Error('Enter valid phone number');
    }

    const usersPhoneRes = await users.findOne({ where: { phone : data.phone },transaction });
    if(usersPhoneRes){
        throw new Error('Phone number already exists');
    }
}

const login = async (data,cb) => {
    let transaction;
    try{
        transaction = await sequelize.transaction();
        
        const id = await validateLogin(data,transaction);

        const token = jwt.sign({id:id},secretOrKey,{expiresIn:expiresIn});

        return cb(null,{message:"login successfully",data:token});
    }catch(error){
        await transaction.rollback(); 
        if (error instanceof Sequelize.ValidationError) {
            return cb("Enter valid details");
        } else {
            return cb(error.message);
        }
    }
}

const validateLogin = async (data,transaction)=>{
    let whereClause;
    if(data.email){
        whereClause = { email : data.email }
    }else{
        whereClause = { phone : data.phone }
    }
    
    const usersRes = await users.findOne({ where: whereClause,attributes:['id','email','phone','password'],transaction});
    if(!usersRes){
        throw new Error('Enter valid credentials');
    }
    
    let matchedWithpass = bcrypt.compareSync(data.password, usersRes.dataValues.password);
    if(!matchedWithpass){
        throw new Error('Enter valid credentials');
    }

    return usersRes.dataValues.id
}

module.exports = {
    register,
    login
}