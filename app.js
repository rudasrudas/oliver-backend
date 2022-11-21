var express = require('express');
const User = require("./model/user");
const auth = require("./auth");
const jwt = require("jsonwebtoken");

var app = express();

//Endpoints

app.get("/", (req, res) => {
    res.send("Hello, server is up!!");
});

app.get('/example', auth, (req, res) => {
    console.log("Example called");
    res.status(200).send("Hey");
});

app.post("/register", async (req, res) => {
    try {
        //Get user input
        const { name, email, password } = req.body;

        //Validate user input
        if(!(email && password && name)) {
            res.status(400).send("Missing user data");
        }

        //Check if user already exists
        //Validate if user is in the database
        const oldUser = await User.findOne({ email });

        if(oldUser){
            return res.status(409).send("User already exists");
        }

        //Encrypt password
        encryptedPassword = await bcrypt.hash(password, 10);

        //Create user in db
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        //Create token
        const token = jwt.sign(
            { user_id: user._id, email},
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );

        //Save user token
        user.token = token;

        //Return new user
        res.status(201).json(user);
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

            //Return user
            res.status(200).json(user);
        }

        res.status(400).send("Invalid credentials");

    } catch (err) {
        console.log(err);
    }
});

var server = app.listen(8083, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Backend server started on " + host + ":" + port);
});