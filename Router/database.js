const mongoose = require('mongoose');
require('dotenv').config()

const url = process.env.DBURL;
const options = {
}
 
exports.db = () => {  
    mongoose.connect(url,options).
    then(console.log("Connected to the datase")).
    catch((err) => console.log("Didn't connect to the database",err))
}