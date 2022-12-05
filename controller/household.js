const Household = require('../model/Household0');
const auth = require("../service/auth");

module.exports = function(app){

    app.get("/household/:hhid", auth.verify, async (req, res) => {
        try {
          const user = auth.getUser(req);
          
          const getHhid = req.params.id;
          const household = await Household.findOne({ getHhid });

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


    app.post('/household', async (req, res) =>{
       // try {
            const { name, address, currency } = req.body;
    
            // if(!(name && address && currency)) {
            //     res.status(400).send("Missing data");
            // } 
            // else{
            console.log(req.body);

            const household = await Household.create({
                name: name,
                address: address,
                currency: currency.toUpperCase()
            });
            console.log("Household created");

            res.status(200).json(household);
           // }
        // }
        // catch (err) {
        //     console.log(err);
        // }
    });
}
