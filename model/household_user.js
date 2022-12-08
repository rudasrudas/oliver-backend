const mongoose = require("mongoose");

<<<<<<< HEAD
const houseHoldUserSchema = new mongoose.Schema({
    householdId: {type: mongoose.Schema.Types.ObjectId, ref: 'household'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    roomSize: {type: Number},
=======
const householdUserSchema = new mongoose.Schema({
    householdId: { type: mongoose.Schema.ObjectId, ref: 'household' },
    userId: { type: mongoose.Schema.ObjectId, ref: 'user' },
    roomSize: { type: Number },
>>>>>>> 7358b7881fff526d668033340e269077bd126258
    balance: { type: Number },
    created: { type: Date, default: Date.now }
})

<<<<<<< HEAD
module.exports = mongoose.model("householduser", houseHoldUserSchema);
=======
module.exports = mongoose.model("household_user", householdUserSchema);

>>>>>>> 7358b7881fff526d668033340e269077bd126258
