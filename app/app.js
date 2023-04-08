const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger/swagger");
const auths = require('basic-auth');
const app = express();
const passport = require('passport');
require('./config/sequelize');
require('dotenv').config();

const options = {
    explorer: false,
    swaggerOptions: {
        authAction :{ Bearer: {name: "Bearer", schema: {type: "apiKey", in: "header", name: "Authorization" }, value: "Bearer <JWT>" } }
    },
    customCss: '.swagger-ui .topbar { display: none }',
};

app.use('/api-docs',(req,res,next)=>{
    let user = auths(req);
    if(user === undefined || user['name'] !== process.env.SWAGGER_USER || user['pass'] !== process.env.SWAGGER_PASSWORD){
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Node"');
        res.end('Unauthorized');
    }else{
        next()
    }
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs.sw, options));

// Handling CROS origin error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    return next();
});

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use(passport.initialize());
require('./config/passport-config');

// controllers
const authController = require('./controller/authController');
const paymentController = require('./controller/paymentCOntroller');
const orderController = require('./controller/orderController');

// routes
app.use('/auth',authController);
app.use('/payment',paymentController);
app.use('/order',orderController);

module.exports = app;