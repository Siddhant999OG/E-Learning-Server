const mongoose = require("mongoose");

require("dotenv").config();

const dbconnect = () => {
    mongoose.connect(process.env.DB)
    .then(() => console.log("DB connected successfully"))
    .catch((error) => console.error("DB connection error:", error));
};

module.exports = dbconnect;