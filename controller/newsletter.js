const Subscriber = require('../model/subscriber');

const mailer = require("../service/mailer");

module.exports = function(app){
    app.post("/newsletter", async (req, res) => {
        try {
            
            //Get user input
            const {email} = req.body;
    
            //Validate user input
            if(!(email)) {
                res.status(400).send("Email provided is invalid");
            }
    
            //Check if user is in the database already
            const oldSubscriber = await Subscriber.findOne({ email });
    
            if(oldSubscriber){
                return res.status(200).send("Subscriber added");
            }
    
    
            //Create subscriber in db
            const Subscriber = await Subscriber.create({
                email: email.toLowerCase(),
            });

            res.status(200).send("OK");
        } catch (err) {
            console.log(err);
        }
    });

    
    app.delete("/newsletter", (req, res) => {
        const { email } = req.body;
        Subscriber.delete({ email });
        console.log("Unsubscribing " + email);
        res.status(200).send("User logged in");
    });
    
    
}