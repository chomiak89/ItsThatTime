const express = require("express");
const router = express.Router();
const passport = require("passport");

//----- TWILIO SET UP
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//----- FUNCTION TO SEND THE TWILIO TEXT
function sendTextMessage(body, owner, number) {
  client.messages
    .create({
      body: `${body} For: ${owner}`,
      from: "+16802066117",
      to: `+1${number}`,
    })
    .then((message) => console.log(message))
    .catch((error) => console.log(error));
}

//password encryption
const bcrypt = require("bcryptjs");

//User Model
const User = require("../models/User");
const Reminder = require("../models/Reminder");
const { ensureAuth } = require("../config/auth");

//PAGES
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", (req, res) => {
  const { name, email, password, passConf } = req.body;
  let errors = [];

  //error checks
  if (!name || !email || !password || !passConf) {
    errors.push({ msg: "All fields are required" });
  }
  if (password !== passConf) {
    errors.push({ msg: "Password and Confirm Password do not match" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password needs to be at least 6 characters long" });
  }

  //handle errors
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      passConf,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      //check if user already exists with the provided email
      if (user) {
        errors.push({
          msg: "Account already exists with provided email address",
        });
        res.render("register", {
          errors,
          name,
          email,
          password,
          passConf,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("successMessage", "Registration Successful");
                res.redirect("/users/login");
              })
              .catch((err) => {
                console.log(err);
              });
          })
        );
      }
    });
  }
});

//LOGIN
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//LOGOUT
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return err;
    req.flash("successMessage", "Logged out successfully");
    res.redirect("/users/login");
  });
});

//CREATE REMINDER
router.get("/createreminder/:email", ensureAuth, (req, res) => {
  let email = req.params.email;
  res.render("createreminder", { email });
});

router.post("/createreminder/:email", ensureAuth, (req, res) => {
  let email = req.params.email;
  const { body, owner, number } = req.body;
  //   const newReminder = new Reminder({
  //     body,
  //     owner,
  //   });
  //-----------------------------------
  User.findOne({ email: email })
    .then((user) => {
      const newReminder = new Reminder({
        body,
        owner,
        user_id: user._id,
        number,
      });
      newReminder
        .save()
        .then((reminder) => {
          res.redirect("/dashboard");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
});
//-----------------------------------
//   newReminder
//     .save()
//     .then((reminder) => {
//       res.redirect("/dashboard");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//REMIND
router.get("/remind/:id", (req, res) => {
  Reminder.findOne({ _id: req.params.id })
    .then((reminder) => {
      console.log(reminder);
      sendTextMessage(reminder.body, reminder.owner, reminder.number);
      req.flash("successMessage", "Reminder Sent Successfully");
      res.redirect("/dashboard");
    })
    .catch((err) => console.log(err));
});
//DELETE
router.get("/delete/:id", (req, res) => {
  Reminder.findOneAndDelete({ _id: req.params.id })
    .then((reminder) => {
      console.log("deleted", reminder);
    })
    .catch((err) => console.log(err));
  res.redirect("/dashboard");
});

module.exports = router;
