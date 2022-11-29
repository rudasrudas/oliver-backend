const User = require('../model/user');

const jwt = require("jsonwebtoken");
const config = process.env;

const verify = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token) {
        return res.status(401).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        // console.log(err);
        return res.status(401).send("Authentication failed");
    }

    return next();
}

const checkLogin = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token) {
        return res.status(401).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        // console.log(err);
        return res.status(401).send("Authentication failed");
    }

    return next();
}

const getUser = async (req) => {
    const token = req.headers["x-access-token"];

    if(!token) {
        return null;
    }

    try {
        const email = jwt.verify(token, config.TOKEN_KEY).email;
        const user = await User.findOne({ email });
        return user;
    } catch (err) {
        return null;
    }
}

module.exports = {verify, checkLogin, getUser};