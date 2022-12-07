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

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("dboliver");
  dbo.collection('User').aggregate([
    { $lookup:
       {
         from: 'Household_user',
         localField: 'id',
         foreignField: 'user_id',
         as: 'household_users'
       }
     }
    ]).toArray(function(err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
    db.close();
  });
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("dboliver");
  dbo.collection('Household').aggregate([
    { $lookup:
       {
         from: 'Household_user',
         localField: 'id',
         foreignField: 'household_id',
         as: 'household_members'
       }
     }
    ]).toArray(function(err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
    db.close();
  });
});