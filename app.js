const app = require('express')(); //Express
const bp = require('body-parser'); //JSON reception compatibility
app.use(require('cors')()); //Enable CORS
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

//Controllers
require('./controller/landing')(app); //Landing page endpoints
require('./controller/overview')(app); //System page endpoints
require('./controller/authentication')(app); //Login and registration page endpoints

require("./model/database").connect();
app.listen(80, () => console.log("HTTP Server started.")); //HTTP server start
