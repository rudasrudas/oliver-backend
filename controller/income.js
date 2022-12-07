const auth = require("../service/auth");
const Earnings = require('../model/earnings');

module.exports = function(app){

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


app.post("/income", async (req, res) => {
  try {
      
      //Get user input
      const {user_id, amount, month} = req.body;
    

      //Validate user input
      if(!(user_id && amount && month)) {
          return res.status(400).send("amount provided is invalid");
      }

      //Create subscriber in db
      const earnings = await Earnings.create({
          user_id: user_id.toLowerCase(),
      });

      return res.status(200).send("OK");
  } catch (err) {
      console.log(err);
  }
});

}