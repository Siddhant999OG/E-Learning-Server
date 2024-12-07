const express = require("express");
const routers = express.Router();

const { register, verifyUser, loginUser, myProfile,  } = require("../controllers/user");
const { auth } = require("../middleware/auth");

routers.post("/register", register);
routers.post("/verifyUser", verifyUser);
routers.post("/login", loginUser);
routers.get("/profile", auth, myProfile)

module.exports = routers;