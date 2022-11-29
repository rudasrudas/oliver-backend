const mongoose = require("mongoose");
require('dotenv').config();

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.log("Failed to connect to the database. Exiting...");
      console.error(error);
      process.exit(1);
    });
};