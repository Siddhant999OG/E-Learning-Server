const express = require("express");
const app = express();

const Razorpay = require("razorpay")
const cors = require("cors")

require("dotenv").config();

exports.instance = new Razorpay({
    key_id : process.env.Razorpay_Key,
    key_secret : process.env.Razorpay_secret
})

app.use(express.json()); // For parsing JSON
app.use(cors());

app.use(express.urlencoded({ extended: true })); // For parsing form data

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const dbconnect = require("./Config/db");
dbconnect();

app.use("/uploads",express.static("uploads"))

// Routes
const Userrouters = require("./routes/user");
const Courserouters = require("./routes/courses");
const adminrouters = require("./routes/admin");

app.use('/api/v1', Userrouters);
app.use('/api/v1', Courserouters);
app.use('/api/v1', adminrouters);

app.get("/", (req, res) => {
    res.send("Kya haal chal bhai");
});