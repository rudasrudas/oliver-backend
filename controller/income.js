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

    app.post('/income', auth, async (req, res) => {
        try {
            const earnings = req.earnings;
      
            await Earnings.findByIdAndUpdate(earnings._id, {
                amount: req.body.amount,
                month: req.body.month,

            })
      
            res.redirect('/income')
        } catch (err) {
            res.status(500).send(err)
        }
      })

}