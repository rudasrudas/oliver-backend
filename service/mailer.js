const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

var transporter = nodemailer.createTransport({
  service: 'gmail',
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

module.exports.send = function send(options){
    transporter.sendMail(options, function(error, info){
        if (!!error)
            return false;
        else
            return true;
    });
}

// // EXAMPLE USE:
// // 
// const mailer = require('./mailer');
// const options = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     subject: `Email subject`,
//     text: `Hello there, this is the content!`
// };
// mailer.send(options);
