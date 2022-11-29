var MongoClient = require('mongodb').MongoClient;

var url ="mongodb+srv://dboliver:dboliver123@cluster0.2vxjkke.mongodb.net/?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("dboliver");
  dbo.collection('User').aggregate([
    { $lookup:
       {
         from: 'Subscriber',
         localField: 'email',
         foreignField: '_id',
         as: 'email'
       }
     }
    ]).toArray(function(err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
    db.close();
  });
});