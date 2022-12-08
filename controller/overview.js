const auth = require("../service/auth");
const mailer = require("../service/mailer");
const bcrypt = require("bcrypt");

const User = require('../model/user');
const Subscriber = require('../model/subscriber');
const HouseholdUser = require('../model/household_user.js');
const Household = require('../model/household.js');

module.exports = function(app){
  app.get("/overview", auth.verify, async (req, res) => {
      try {
          const user = await auth.getUser(req);
          
          const joined = await User.aggregate([
            {
              $match: { email: user.email }
            },
            {
              $lookup: {
                from: 'subscribers',
                localField: 'email',
                foreignField: 'email',
                as: 'subscribtion'
              }
            }
          ]);
  
          const response = { 
            "balance": 12000,
            "user": user,
            "households": [ 
              { 
                "hhid": "hh1234", 
                "name": "My home", 
                "balance": -200, 
                "users": [ 
                  { 
                    "uid": "u1234", 
                    "name": "John", 
                      "surname": "Doe",
                      "email": "john@doe.com" 
                  } 
                ] 
              } 
            ], 
            "expenses": [ 
              // { 
              //   "eid": "e1234", 
              //   "user": { 
              //     "uid": "u1234", 
              //     "name": "John", 
              //     "surname": "Doe", 
              //     "email": "john@doe.com" 
              //   }, 
              //   "amount": 250, 
              //   "date": "UTC2022-12-01T00:00", 
              //   "category": { 
              //     "cid": "c123", 
              //     "title": "Shopping" 
              //   } 
              // } 
            ] 
          } 
          
          res.status(200).send(JSON.stringify(response));
      } catch (err) {
          console.log(err);
          res.status(400).send("Error occured while retrieving user data");
      }
  });

  app.get("/personal-info", auth.verify, async (req, res) => {
    try {
      const user = await auth.getUser(req);
      const dbUser = await User.findOne({ 'email': user.email });
      const subscription = await Subscriber.findOne({ 'email': user.email });
      const householdUsers = await HouseholdUser.find({ });
      console.log("HH:" + householdUsers);
      // const householdUsers = await HouseholdUser.find({ 'userId': dbUser._id });
      const households = []; 
      householdUsers.forEach(async (hhu) => {
        const hh = await Household.findById(hhu.householdId);
        const hhJson = {
          "hhid": hh._id,
          "name": hh.name,
          "roomSize": hhu.roomSize,
          "canEdit": hh.allowEdit,
          "canLeave": (hhu.balance >= 0)
        }
        households.push(hhJson);
      });
      // console.log("HOUSEHOLDS: ");
      // console.log(households);

      const response = { 
        "estimatedMonthlyIncome": dbUser.estimatedMonthlyIncome,
        "newsletter": (subscription != null),
        "user": user,
        "households": households
        // [
        //   { 
        //     "hhid": "hh1234", 
        //     "name": "My home", 
        //     "roomSize": 12.5,
        //     "canEdit": true,
        //     "canLeave": true
        //   } 
        // ]
      } 
      
      res.status(200).send(JSON.stringify(response));
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving personal info");
    }
  });

  app.put("/personal-info", auth.verify, async (req, res) => {
    try {
      const json = req.body;
      const user = await auth.getUser(req);
      const dbUser = await User.findOne({ "email": user.email });
      let subscribed;

      //Update user info
      await User.findOneAndUpdate({ '_id': dbUser._id }, {
        "estimatedMonthlyIncome": json.estimatedMonthlyIncome,
        "name": json.user.name,
        "surname": json.user.surname,
      });
      user.name = json.user.name;
      user.surname = json.user.surname;
      
      //Update household room sizes
      json.households.forEach(async (hhu) => {
        try{
          const householdUser = await HouseholdUser.findOne({ "userId": dbUser._id, "householdId": hhu.hhid });
          if(householdUser){
            const household = await Household.findById(householdUser.hhid);
            if(household.allowEdit){
              HouseholdUser.findOneAndUpdate({ "_id": householdUser._id }, { "roomSize": hhu.roomSize });
            } else return res.status(400).send("User is not allowed to edit the room size for this household");
          } else return res.status(400).send("User is not part of the chosen household");
        } catch (err) {
          // console.log(err);
        }
      });

      //Change password
      if(await bcrypt.compare(json.user.password, dbUser.password)){
        if(json.user.newPassword.length >= 10){
          //Encrypt new password
          encryptedPassword = await bcrypt.hash(json.user.newPassword, 10);

          await User.findOneAndUpdate({ '_id': dbUser._id }, {
            "password": encryptedPassword,
          });
        }  else return res.status(430).send("New password must be at least 10 characters long");
      } else if (json.user.newPassword.length > 0) {
        return res.status(430).send("Old password is incorrect");
      }

      //Update subscription
      const currentSubscription = await Subscriber.findOne({ "email": user.email });
      if(currentSubscription && !json.newsletter){
        currentSubscription.remove(); //Unsubscribe
        subscribed = false;
      } else if (!currentSubscription && json.newsletter){ 
        await Subscriber.create({ "email": user.email.toLowerCase() }); //Subscribe
        subscribed = true;
      }

      //Generate response
      const householdUsers = await HouseholdUser.find({ 'userId': dbUser._id });
      const households = []; 
      householdUsers.forEach(async (hhu) => {
        const hh = await Household.findById(hhu.householdId);
        const hhJson = {
          "hhid": hh._id,
          "name": hh.name,
          "roomSize": hhu.roomSize,
          "canEdit": hh.allowEdit,
          "canLeave": (hhu.balance >= 0)
        }
        households.push(hhJson);
      });

      const response = { 
        "estimatedMonthlyIncome": dbUser.estimatedMonthlyIncome,
        "newsletter": subscribed,
        "user": user,
        "households": households
      } 
      
      res.status(200).send(JSON.stringify(response));
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving personal info");
    }
  });
}