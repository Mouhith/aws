const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const routs = require("./routs");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

try {
  app.listen(process.env.PORT, () => {
    console.log("server is running");
  });

  app.use("/auth", routs);
} catch (err) {
  throw new Error(err);
}
