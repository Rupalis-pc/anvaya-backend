const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

async function initializeDatabase() {
  await mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to the Database."))
    .catch((error) => console.log("Error connecting to Database.", error));
}

module.exports = { initializeDatabase };
