var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.DB_URI, function(err, db)
{
    if(err) throw err;

    var dbo =db.db("dboliver")

    dbo.createCollection("Category", function(err, res){

        if(err) throw err
        console.log("collection created");
        db.close();
    })
});