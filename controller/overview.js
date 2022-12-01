const Household = require('../model/Household0');
const Expense = require('../model/Expense0');

const auth = require("../service/auth");

module.exports = function(app){
    app.get("/overview", auth.verify, async (req, res) => {
        try {
            const user = auth.getUser(req);
    
            const response = {
                "balance": user.balance,
                "households": [],
                "expenses": []
            }
            
            res.status(200).send(JSON.stringify(response));
        } catch (err) {
            console.log(err);
            res.status(400).send("Error occured while retrieving user data");
        }
    });
}