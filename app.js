require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT;
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

//----- PASSPORT CONFIGURATION
require("./config/passport")(passport);

//----- DB CONFIG
const db = require("./config/keys").MongoURI;

//----- CONNECT TO MONGO
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//----- HANDLEBARS SET UP
const hbs = require("hbs");
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");

//----- BODYPARSER
app.use(express.urlencoded({ extended: false }));

//----- EXPRESS SESSION
app.use(
  session({
    secret: "cat",
    resave: true,
    saveUninitialized: true,
  })
);

//----- PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//----- FLASH
app.use(flash());

//----- TWILIO SET UP
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//----- GLOBAL
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  res.locals.error = req.flash("error");
  next();
});

//----- ROUTES
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

// app.get("/", (req, res) => {
//   res.render("index");
//   sendTextMessage();
// });

//----- LISTENING PORT FOR EXPRESS
app.listen(port, () => {
  console.log("Server is listening on port 3000");
});

//----- FUNCTION TO SEND THE TWILIO TEXT
function sendTextMessage() {
  client.messages
    .create({
      body: "Hello from the app that will win Shell Hack!",
      from: "+16802066117",
      to: "+18159812476",
    })
    .then((message) => console.log(message))
    .catch((error) => console.log(error));
}
