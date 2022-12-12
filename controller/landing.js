const auth = require('../service/auth');
const mailer = require("../service/mailer");

const Subscriber = require('../model/subscriber');

module.exports = function(app){

    app.get("/", auth.checkLogin, (req, res) => {
        res.status(200).send("User logged in");
    });
    
    app.post('/send-message', (req, res) =>{
        try {
            const { name, email, text } = req.body;
    
            if(!(name && email && text) || text.length < 50) {
                res.status(400).send("Missing data");
            } 
            else{
                console.log(req.body);
    
                const mailInfo = {
                    from: 'Oliver <coliver.kea@gmail.com>',
                    to: process.env.EMAIL_USER,
                    replyTo: email,
                    subject: `Message from ${name}`,
                    text: `Message from ${name} (${email}):\n${text}`
                };
                
                switch(mailer.send(mailInfo)){
                    case true: return res.status(200).send("Message sent"); break;
                    case false: return res.status(400).send("Failed to send message"); break;
                }
    
                res.status(200).send("Message sent");
            }
        }
        catch (err) {
            console.log(err);
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
    
    //delete a subscriber by email
    app.delete('/newsletter', async(req, res) =>{
    try{
        const getEmail = req.body.email;
        const subscriber = await Subscriber.findOne({ 'email': getEmail });

        if(subscriber){
            subscriber.remove();
            res.status(200).send("Unsubscribed successfully");
        } else {
            res.status(400).send("Subscriber email is invalid");
        }
    }
    catch(err)
    {
        console.log(err);
    }
    });
}