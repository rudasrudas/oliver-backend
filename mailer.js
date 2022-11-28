const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
  
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Connected to SMTP server");
    }
});

module.exports.send = function send(res, options){
    transporter.sendMail(options, function(error, info){
        if (!!error)
            return res.status(440).send("Failed to send the message via email. Unknown error occured");
        else
            return res.status(200).send("Message sent");
    });
}

// EXAMPLE USE:
// 
// const mailer = require('./mailer');
// const options = {
//     from: 'hello@example.com',
//     to: 'hello@example.com',
//     subject: `Email subject`,
//     text: `Hello there, this is the content!`
// };
// return mailer.send(res, options);