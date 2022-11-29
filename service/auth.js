const jwt = require("jsonwebtoken");
const config = process.env;

const verify = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token) {
        return res.status(403).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        // console.log(err);
        return res.status(403).send("Authentication failed");
    }

    return next();
}

const checkLogin = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token) {
        return res.status(403).send("A token is required for authentication");
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

module.exports = {verify, checkLogin};