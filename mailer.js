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
  
// transporter.verify(function (error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Connected to SMTP server");
//     }
// });

// module.exports.send = function send(res, options){
//     transporter.sendMail(options, function(error, info){
//         if (!!error)
//             return res.status(440).send("Failed to send the message via email. Unknown error occured");
//         else
//             return res.status(200).send("Message sent");
//     });
// }

// // EXAMPLE USE:
// // 
// const mailer = require('./mailer');
// const options = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     subject: `Email subject`,
//     text: `Hello there, this is the content!`
// };
// return mailer.send(res, options);



var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'coliver.kea@gmail.com',
    pass: 'uhwbputaiivuhffp'
  }
});

var mailOptions = {
  from: 'coliver.kea@gmail.com',
  to: 'coliver.kea@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};


    
function sendEmails(options){
    transporter.sendMail(options, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
sendEmails(mailOptions)

module.exports = {
    sendEmails
};

