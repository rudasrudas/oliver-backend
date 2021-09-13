const express = require('express');
const cors = require('cors');

const fs = require('fs');
const https = require('https');
var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.mecena.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.mecena.net/fullchain.pem')
};

const app = express();
app.use(cors());
app.use(express.json());

require('./controller')(app);

const port = process.env.PORT || 443;
https.createServer(options, app).listen(port);
