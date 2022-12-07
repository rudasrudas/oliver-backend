// var MongoClient = require('mongodb').MongoClient;

// var url ="mongodb+srv://dboliver:dboliver123@cluster0.2vxjkke.mongodb.net/?retryWrites=true&w=majority";

// MongoClient.connect(url, function(err, db)
// {
//     if(err) throw err;

//     var dbo =db.db("dboliver")

//     dbo.createCollection("Household_user", function(err, res){

//         if(err) throw err
//         console.log("collection created");
//         db.close();

//     })
// })
const mongoose = require("mongoose");

const houseHoldUserSchema = new mongoose.Schema({
    household_id: {type: mongoose.Schema.Types.ObjectId, ref: 'household'},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    room_size: {type: Number},
    balance: { type: Number },
    created: {
		type: Date,
		default: Date.now
	},
})

module.exports = mongoose.model("householdUser", houseHoldUserSchema);
