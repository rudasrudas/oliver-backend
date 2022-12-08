const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
<<<<<<< HEAD
    userId: { type: String },
    amount: { type: Number },
    month: {type: Date}
=======
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    amount: {type: Number},
    month: {type: Date, default: Date.now}
>>>>>>> 7358b7881fff526d668033340e269077bd126258
})

module.exports = mongoose.model("earnings", earningsSchema);