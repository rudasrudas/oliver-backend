// var MongoClient = require('mongodb').MongoClient;

// var url ="mongodb+srv://dboliver:dboliver123@cluster0.2vxjkke.mongodb.net/?retryWrites=true&w=majority";

// MongoClient.connect(url, function(err, db)
// {
//     if(err) throw err;

//     var dbo =db.db("dboliver")

//     dbo.createCollection("Household", function(err, res){

//         if(err) throw err
//         console.log("collection created");
//         db.close();

//     })
// })

const mongoose = require("mongoose");

const houseHoldSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    join_key: {type: String},
    currency: { type: String },
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
})

module.exports = mongoose.model("household", houseHoldSchema);
