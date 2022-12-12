const Household = require('../model/household');
const HouseholdUser = require('../model/household_user');
const User = require('../model/user');
const ObjectId = require('mongodb').ObjectId;
const HouseholdService = require("../service/household");

const auth = require("../service/auth");
const mongoose = require("mongoose");
const user = require('../model/user');

module.exports = function(app){

  //get all households - for testing purposes
  app.get("/households", async (req, res) => {
    try {
      const households = await Household.find();

      if(households != null){
        res.status(200).json(households);
      }          
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving household data");
    }
  });

  // get household by ID
  app.get("/household/:hhid", auth.verify, async (req, res) => { 
    try {
      const hhid = req.params.id;
      const household = await Household.findOne({ '_id':  mongoose.Types.ObjectId(hhid)});

      const user = auth.getUser(req);

      // check if household exists
      if(household == null) return res.status(400).send("Household ID is invalid");

      // check if logged in user is a household member
      const isHouseholdUser = await HouseholdUser.findOne({ 'household_id': household._id, 'user_id': user._id });
      if(!isHouseholdUser) return res.status(403).send("User is not part of the household");

      return res.status(200).json(household);
                 
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving household data");
    }
  });

  // create a household (and a household_user)
  app.post('/household', auth.verify, async (req, res) =>{ 
    try {
      const { name, address, currency } = req.body;

      if(!(name && address && currency)) {
          res.status(400).send("Provided data is invalid");
      } 
      else{
      console.log(req.body);

          //check if user is in no more than 4 households
        if(household_service.UnderFour(user)){

          const household = await Household.create({
              name,
              address,
              joinKey: new ObjectId(),
              currency: currency.toUpperCase(),
              admin: mongoose.Types.ObjectId(user),
          });
          console.log("Household created");
          res.status(200).json(household);

          //Create household_user who is the admin of the new household
          const newHouseholdUser = await HouseholdUser.create({
            householdId: mongoose.Types.ObjectId(household),
            userId: mongoose.Types.ObjectId(user),
            roomSize: 0,
            balance: 0,
            created: new Date(),
          })
          console.log("Household user created successfully");
          console.log(newHouseholdUser);
        }
      }
    }
    catch (err) {
        console.log(err);
    }
  });

  app.delete('/household/:hhid', auth.verify, async (req, res) =>{ 

    try{
      const user = auth.getUser(req);
      const hhid = req.params.id;
      const household = await Household.findOne({ '_id':  mongoose.Types.ObjectId(hhid)});

      //check if user is admin
      const isAdmin = mongoose.Types.ObjectId(household.admin).equals(mongoose.Types.ObjectId(user._id));
       if(isAdmin){
        if(household != null){
          household.remove();
          res.status(200).send("Household is deleted");
          console.log("Household is deleted")
        }else{
          res.status(403).send("User is not the household admin");
        }
     }
    }
    catch(err)
    {
      console.log(err);
    }
  });

  app.delete("/household/:hhid/user/:uid", auth.verify, async (req, res) => {
    try {
      const user = await auth.getUser(req);

      const hhid = req.params.hhid;
      const uid = req.params.uid;

      if(!hhid || hhid.length !== 24) return res.status(400).send("Household doesn't exist"); 
      if(!uid || uid.length !== 24) return res.status(400).send("User doesn't exist"); 
      
      const household = await Household.findOne({ '_id':  mongoose.Types.ObjectId(hhid)});
      if(!household) return res.status(400).send("Household doesn't exist");

      const caller = await User.findOne({ 'email': user.email });
      if(!caller) return res.status(403).send("Logged in user does not have access to this function");

      const leaver = await User.findOne({ '_id': mongoose.Types.ObjectId(uid)});
      if(!leaver) return res.status(400).send("User doesn't exist");

      const householdUser = await HouseholdUser.findOne({ 'household_id': household._id, 'user_id': leaver._id });
      if(!householdUser) return res.status(200).send("User is not part of the household");

      const isAdmin = mongoose.Types.ObjectId(household.admin).equals(mongoose.Types.ObjectId(caller._id));
      const removingThemselves = mongoose.Types.ObjectId(caller._id).equals(mongoose.Types.ObjectId(leaver._id));

      //If user is an admin or is leaving the household by themselves, proceed
      if(isAdmin || removingThemselves) {
        householdUser.remove();

        //If the admin is removing themselves, assign new admin
        if(isAdmin && removingThemselves) {
          const newHouseholdUserAdmin = await HouseholdUser.findOne({ 'household_id': hhid }).sort({ 'created': 1 });

          //If there's no members left, delete the household
          if(!newHouseholdUserAdmin){
            //TODO: Delete household
          }

          const newAdmin = await User.findOneAndUpdate({ '_id': newHouseholdUserAdmin.user_id });
          household.updateOne({ 'admin': mongoose.Types.ObjectId(newAdmin) });
        }

        return res.status(200).send("User removed from household");
      }

      res.status(403).send("Caller is not allowed to remove the leaver from the household");
    } 
    catch(err) {
      console.log(err);
      res.status(400).send("Failed to remove user from a household");
    }
  });
}
