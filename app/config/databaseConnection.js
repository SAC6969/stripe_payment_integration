require('dotenv').config();
// const enviroment_variable = "PROD";
const enviroment_variable = "STAGE";

if(enviroment_variable === "STAGE"){
    module.exports = {
        DATABASE_NAME: process.env.STAGE_DATABASE_NAME,
        USER_NAME: process.env.STAGE_USER_NAME,
        PASSWORD: process.env.STAGE_PASSWORD,
        HOST: process.env.STAGE_HOST,
        DIALECT: process.env.STAGE_DIALECT
    }
}else{
    module.exports = {
        DATABASE_NAME: process.env.PROD_DATABASE_NAME,
        USER_NAME: process.env.PROD_USER_NAME,
        PASSWORD: process.env.PROD_PASSWORD,
        HOST: process.env.PROD_HOST,
        DIALECT: process.env.PROD_DIALECT
    }
}
