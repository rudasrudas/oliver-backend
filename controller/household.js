const Household = require('../model/household');
const household_user = require('../model/household_user');
const auth = require("../service/auth");
const ObjectId = require('mongodb').ObjectId;
const household_service = require("../service/household");

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


    app.get("/household/:hhid", async (req, res) => { //auth.verify
        try {
          

          const getHhid = req.params.id;
          const household = await Household.findOne({ getHhid });

          const user = auth.getUser(req);

          if(household != null){
            res.status(200).json(household);
          } 
          else{
            res.status(400).send("Household ID is invalid");
          }           
        } catch (err) {
            console.log(err);
            res.status(400).send("Error occured while retrieving household data");
        }
    });

    app.post('/household', async (req, res) =>{ //auth.verify
        try {
            const { name, address, currency } = req.body;
    
            if(!(name && address && currency)) {
                res.status(400).send("Provided data is invalid");
            } 
            else{
            console.log(req.body);

            //check if user is in no more than 4 households
          //if(household_service.UnderFour(user)){

            const household = await Household.create({
                name,
                address,
                joinKey: new ObjectId(),
                currency: currency.toUpperCase(),
                admin: null,
            });
            console.log("Household created");

            res.status(200).json(household);

            //Create household user
            const new_household_user = await household_user.create({
              householdId: household,
              userId: null, //user+-+
              roomSize: null,
              balance: 0,
              created: new Date(),
            })
            console.log(new_household_user);
        // }
          }
        }
        catch (err) {
            console.log(err);
        }
    });

    app.delete('/household/:hhid', async(req, res) =>{ //auth.verify

      try{
        const user = auth.getUser(req);
        const getHhid = req.params.id;
        const household = await Household.findOne({ "hhid": getHhid });

        //check if user is admin
       // if(user == household.admin){
          if(household != null){
            household.remove();
            res.status(200).send("Household is deleted");
            console.log("Household is deleted")
          }else{
            res.status(400).send("Household ID is invalid");
          }
      // }
      }
      catch(err)
      {
        console.log(err);
      }
    })
}
