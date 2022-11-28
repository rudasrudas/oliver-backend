var express = require('express');
const User = require("./model/user");
const auth = require("./auth");
const jwt = require("jsonwebtoken");
const https = require('https');
const fs = require('fs');
const bp = require('body-parser');
const cors = require('cors');
const mailer = require('./mailer');


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2vxjkke.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


var app = express();
app.use(cors());
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.mecena.net/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.mecena.net/fullchain.pem')
  };

//Endpoints

app.get("/", (req, res) => {
    res.send("<img src='http://placekitten.com/200/300'>");
});

app.post('/example', (req, res) => {
    console.log(req.body);
    
    res.status(200).send(JSON.stringify({"info": req.body.name}));
});

app.post("/register", async (req, res) => {
    try {
        //Get user input
        console.log(req.body);
        const { name, email, password } = req.body;

        //Validate user input
        if(!(email && password && name)) {
            res.status(400).send("Missing user data");
        }

        const options = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Hi ${name}!`,
            text: `Hello there, thanks for registering, dumbass :)`
        };
        mailer.send(res, options);

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

app.listen(80, () => console.log("HTTP Server started."));

// app.on('error', (e) => {
//     if (e.code === 'EADDRINUSE') {
//       console.log('Address in use, retrying...');
//     //   setTimeout(() => {
//     //     app.close();
//         // app.listen(80, () => console.log("HTTP Server started."));
//     //   }, 1000);
//     }
//   }); 
//   console.log("H");

// https.createServer(options, app).listen(443, () => console.log("HTTPS Server started."));



// require('./controller/authentication')(app);