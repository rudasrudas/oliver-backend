var MongoClient = require('mongodb').MongoClient;

var url ="mongodb+srv://dboliver:dboliver123@cluster0.2vxjkke.mongodb.net/?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db)
{
    if(err) throw err;

    var dbo =db.db("dboliver")

    dbo.createCollection("Subscriber", function(err, res){

        if(err) throw err
        console.log("collection created");
        db.close();

    })
})