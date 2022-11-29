// const Repository = require('./repository');
// const Services = require('./service');
const User = require('../model/user');

const auth = require("../service/auth");
const mailer = require("../service/mailer");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = function(app){
    app.post("/register", async (req, res) => {
        try {
            //Get user input
            const { name, surname, email, password } = req.body;
    
            //Validate user input
            if(!(email && password && name && surname)) {
                res.status(400).send("Missing user data");
            }
    
            //Check if user is in the database already
            const oldUser = await User.findOne({ email });
    
            if(oldUser){
                return res.status(409).send("User already exists");
            }
    
            //Encrypt password
            encryptedPassword = await bcrypt.hash(password, 10);
    
            //Create user in db
            const user = await User.create({
                name,
                surname,
                email: email.toLowerCase(),
                password: encryptedPassword
            });

            res.status(200).send("User registered");
        } catch (err) {
            console.log(err);
        }
    });
    
    app.post("/login", async (req, res) => {
        try {
            //Get user input
            const { email, password } = req.body;
    
            //Validate user input
            if(!(email && password)) {
                res.status(400).status("Missing user data");
            }
    
            //Validate that user is in db
            const user = await User.findOne({ email });
    
            if (user && (await bcrypt.compare(password, user.password))) {
                //Create token
                const token = jwt.sign(
                    { user_id: user._id, email},
                    process.env.TOKEN_KEY,
                    { expiresIn: "2h" }
                );
    
                //Save user token
                user.token = token;

                console.log(token);
                console.log(jwt.verify(token, process.env.TOKEN_KEY));
    
                //Return user
                res.status(200).json(user);
            }
    
            res.status(400).send("Invalid credentials");
    
        } catch (err) {
            console.log(err);
        }
    });
}