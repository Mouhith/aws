const express = require("express");
const routs = express.Router();
const contro = require("./contro");

routs.post("/register", contro.registeruser);
routs.post("/userVerification", contro.conformUser);
routs.post("/login", contro.loginUser);
routs.post("/VerifyAndRefresh", contro.VerifyAndRefresh);
module.exports = routs;
