const auth = require("../service/auth");
const mailer = require("../service/mailer");

const Subscriber = require('../model/subscriber');

module.exports = function(app){
    app.get("/overview", auth.verify, async (req, res) => {
        try {
            const user = await auth.getUser(req);
            console.log(user);
    
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
            
            return res.status(200).send(JSON.stringify(response));
        } catch (err) {
            console.log(err);
            return res.status(400).send("Error occured while retrieving user data");
        }
    });

    app.get("/personal-info", auth.verify, async (res, req) => {
      try {
        const user = await auth.getUser(req);
        console.log(user);

        const response = { 
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
          ]
        } 
        
        return res.status(200).send(JSON.stringify(response));
      } catch (err) {
          console.log(err);
          return res.status(400).send("Error occured while retrieving personal info");
      }
    });

    app.post("/newsletter", async (req, res) => {
      try {
          
          //Get user input
          const {email} = req.body;
  
          //Validate user input
          if(!(email)) {
              return res.status(400).send("Email provided is invalid");
          }
  
          //Check if user is in the database already
          const oldSubscriber = await Subscriber.findOne({ email });
  
          if(oldSubscriber){
              return res.status(200).send("Subscriber added");
          }
  
  
          //Create subscriber in db
          const subscriber = await Subscriber.create({
              email: email.toLowerCase(),
          });

          return res.status(200).send("OK");
      } catch (err) {
          console.log(err);
      }
    });

    
    //delete a subscriber by email
    app.delete('/newsletter/:email', async(req, res) =>{

      //check if user is admin
      try{
        const getEmail = req.params.email;
        const subscriber = await Subscriber.findOne({ getEmail });
        if(subscriber != null){
          subscriber.remove();
          res.status(200).send("subscriber is deleted");
          console.log("subscriber is deleted")
        }else{
          res.status(400).send("subscriber email is invalid");

        }
      }
      catch(err)
      {
        console.log(err);
      }
    })


      //get all newsletter - for testing purposes
  app.get("/newsletter", async (req, res) => {
    try {
      const subscriber = await Subscriber.find();

      if(subscriber != null){
        res.status(200).json(subscriber);
      }          
    } catch (err) {
        console.log(err);
        res.status(400).send("Error occured while retrieving subscribers data");
    }
});
 

    
   
}