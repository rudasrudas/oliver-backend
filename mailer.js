const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.lt",
    port: 587,
    secure: false,
    auth: {
        user: "hello@mecena.net",
        pass: "@LD!Qz8x9WTNhR#"
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
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
}