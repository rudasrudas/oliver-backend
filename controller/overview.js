const auth = require("../service/auth");
const mailer = require("../service/mailer");

const User = require('../model/user');
const Subscriber = require('../model/subscriber');

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

            console.log(joined[0]);
            
    
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

        const response = { 
          "estimatedMonthlyIncome": 12000,
          "newsletters": true,
          "user": user,
          "households": [ 
            { 
              "hhid": "hh1234", 
              "name": "My home", 
              "roomSize": 12.5,
              "canEdit": true,
              "canLeave": true
            } 
          ]
        } 
        
        res.status(200).send(JSON.stringify(response));
      } catch (err) {
          console.log(err);
          res.status(400).send("Error occured while retrieving personal info");
      }
    });

    app.post("/newsletter", async (req, res) => {
      try {
          
          //Get user input
          const {email} = req.body;
  
          //Validate user input
          if(!email) {
              res.status(400).send("Email provided is invalid");
          }
  
          //Check if user is in the database already
          const oldSubscriber = await Subscriber.findOne({ email });
          console.log(oldSubscriber);
  
          if(oldSubscriber){
              return res.status(200).send("Subscriber added");
          }
  
          //Create subscriber in db
          const sub = await Subscriber.create({
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