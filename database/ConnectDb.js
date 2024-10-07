const mongoose = require('mongoose'); // include mongodb package
require('dotenv').config()

const Connect_DB = () => {

    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    db.on("error",(error)=>console.log(error));
    db.once("open",()=>console.log("DB Connected"));
}


module.exports = Connect_DB