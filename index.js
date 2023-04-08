require('dotenv').config();
const app = require('./app/app');
var PORT = process.env.PORT
app.listen(PORT,function(){
    console.log("Server Started At Port Number ",PORT);
})
