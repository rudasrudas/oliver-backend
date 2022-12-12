const auth = require("../service/auth");
const mailer = require("../service/mailer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require('../model/user');
const Subscriber = require('../model/subscriber');
const HouseholdUser = require('../model/household_user.js');
const Household = require('../model/household.js');
const Earnings = require('../model/earnings');
const Category = require('../model/category');
const ExpensePayer = require('../model/expense_payer');
const Expense = require('../model/expense');

async function getPersonalInfoHouseholds(uid){
  const householdUsers = await HouseholdUser.find({ user_id: mongoose.Types.ObjectId(uid) });

  let hhIds = [];
  householdUsers.forEach((hhu) => { hhIds.push(mongoose.Types.ObjectId(hhu.household_id)) });
  const households = await Household.find({ _id: { $in: hhIds } });

  let jsonHouseholds = []; 
  households.forEach((hh) => {
    try {
      const hhu = householdUsers.filter((e) => {
        return mongoose.Types.ObjectId(e.user_id).equals(mongoose.Types.ObjectId(uid)) &&
               mongoose.Types.ObjectId(e.household_id).equals(mongoose.Types.ObjectId(hh._id));
      })[0];

      if(hh && hhu){
        jsonHouseholds.push({
          "hhid": hh._id,
          "name": hh.name,
          "roomSize": hhu.room_size,
          "canEdit": hh.allow_edit,
          "canLeave": (hhu.balance >= 0)
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

  return jsonHouseholds;
}

async function getOverviewHouseholds(uid){
  const householdUsers = await HouseholdUser.find({ user_id: mongoose.Types.ObjectId(uid) });

  let hhIds = [];
  householdUsers.forEach((hhu) => { hhIds.push(mongoose.Types.ObjectId(hhu.household_id)) });
  const households = await Household.find({ _id: { $in: hhIds } });

  let jsonHouseholds = []; 
  for await (const hh of households){
    try {
      const hhu = householdUsers.filter((e) => {
        return mongoose.Types.ObjectId(e.user_id).equals(mongoose.Types.ObjectId(uid)) &&
               mongoose.Types.ObjectId(e.household_id).equals(mongoose.Types.ObjectId(hh._id));
      })[0];

      if(hh && hhu){
        let jsonUsers = await getUsers(hh._id);
        //Remove logged in user from the user list
        jsonUsers = jsonUsers.filter((e) => { return !mongoose.Types.ObjectId(e._id).equals(mongoose.Types.ObjectId(uid)) });

        jsonHouseholds.push({
          "hhid": hh._id,
          "name": hh.name,
          "balance": hhu.balance,
          "users": jsonUsers
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  return jsonHouseholds;

}

async function getUsers(hhid){
  const householdChildren = await HouseholdUser.find({ household_id: mongoose.Types.ObjectId(hhid) });
  let uIds = [];
  householdChildren.forEach((hhu) => { uIds.push(mongoose.Types.ObjectId(hhu.user_id)) });
  return await User.find({ _id: { $in: uIds }});
}

async function getOverviewExpenses(uid){

  return [];
}

module.exports = function(app){
  app.get("/overview", auth.verify, async (req, res) => {
      try {
          const user = await auth.getUser(req);
          const dbUser = await User.findOne({ 'email': user.email });
          
          // const joined = await User.aggregate([
          //   {
          //     $match: { email: user.email }
          //   },
          //   {
          //     $lookup: {
          //       from: 'subscribers',
          //       localField: 'email',
          //       foreignField: 'email',
          //       as: 'subscribtion'
          //     }
          //   }
          // ]);

          const jsonHouseholds = await getOverviewHouseholds(dbUser._id);
          const jsonExpenses = await getOverviewExpenses(dbUser._id);
  
          const response = { 
            "balance": dbUser.balance,
            "user": {
              "uid": dbUser._id,
              "name": user.name,
              "surname": user.surname,
              "email": user.email
            },
            "households": jsonHouseholds,
            "expenses": jsonExpenses
              // [ 
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
              // ] 
          } 
          
          res.status(200).send(JSON.stringify(response));
      } catch (err) {
          console.log(err);
          res.status(400).send("Error occured while retrieving user data");
      }
  });

  app.post("/expense", auth.verify, async (req, res) => {
    try {
      const hhid = req.query.household;
      const user = await auth.getUser(req);
      const { cid, date, amount, payers, recurring } = req.body;

      if(!(cid && date && amount && payers && recurring)) return res.status(400).send("Insufficient data provided");

      const dbUser = await User.findOne({ 'email': user.email });
      if(!dbUser) return res.status(403).send("Logged in user does not have access to this function");

      const category = await Category.findOne({ '_id': mongoose.Types.ObjectId(cid)});
      if(!category) return res.status(400).send("Category not found");

      const payDate = Date.parse(date);
      if(!payDate) return res.status(400).send("Date is invalid");



    } catch(err) {
      return res.status(400).send("Error occured while submitting an expense");
    }
  });

  app.get("/personal-info", auth.verify, async (req, res) => {
    try {
      const user = await auth.getUser(req);
      const dbUser = await User.findOne({ 'email': user.email });
      const subscription = await Subscriber.findOne({ 'email': user.email });
      const jsonHouseholds = await getPersonalInfoHouseholds(dbUser._id);

      const response = { 
        "estimatedMonthlyIncome": dbUser.estimatedMonthlyIncome,
        "newsletter": (subscription != null),
        "user": user,
        "households": jsonHouseholds
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
      const jsonHouseholds = await getPersonalInfoHouseholds(dbUser._id);

      const response = { 
        "estimatedMonthlyIncome": dbUser.estimatedMonthlyIncome,
        "newsletter": subscribed,
        "user": user,
        "households": jsonHouseholds
      } 
      
      res.status(200).send(JSON.stringify(response));
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving personal info");
    }
  });
 
  //INCOME
  //get all income - for testing purposes
  app.get("/income", async (req, res) => {
    try {
      const earnings = await Earnings.find();

      if(earnings != null){
        res.status(200).json(earnings);
      }          
    } catch (err) {
      console.log(err);
      res.status(400).send("Error occured while retrieving income data");
    }
  });

  app.post("/income",auth.verify, async (req, res) => {
    try {
        
        const user = await auth.getUser(req);
        //Get user input
        const {amount, month} = req.body;
      
  
        //Validate user input
        if(!(user._id && amount && month)) {
            return res.status(400).send("amount provided is invalid");
        }
  
        //update income
        const earnings = await Earnings.create({
          userId: user._id,
            amount,
            month,
        });
  
        return res.status(200).send("OK");
    } catch (err) {
        console.log(err);
    }
  });
    
  //delete a income by date 
  app.delete('/income', async(req, res) =>{
    //check if user is admin
    try{
      const getMonth = req.body.month;
      const income = await Earnings.findOne({ getMonth });
      if(income != null){
        income.remove();
        res.status(200).send("Income deleted successfully");
        console.log("income is deleted")
      }else{
        res.status(400).send("The data provided is invalid");

      }
    }
    catch(err)
    {
      console.log(err);
    }
  });
}