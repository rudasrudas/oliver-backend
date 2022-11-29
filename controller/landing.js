// const Repository = require('../repository/');
// const Services = require('../service/');
const auth = require('../service/auth');

const mailer = require("../service/mailer");

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
}