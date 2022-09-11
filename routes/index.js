const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../config/auth");

const User = require("../models/User");
const Reminder = require("../models/Reminder");

router.get("/", (req, res) => res.render("index"));

router.get("/dashboard", ensureAuth, (req, res) => {
  //find user in db then pull reminders from there
  //pass the data to render dashboard
  //render dashboard in the .then of it

  User.findOne({ email: req.user.email })
    .then((user) => {
      let id = user._id;
      Reminder.find({ user_id: id })
        .then((reminders) => {
          res.render("dashboard", {
            name: req.user.name,
            email: req.user.email,
            reminders,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  //   res.render("dashboard", {
  //     name: req.user.name,
  //     email: req.user.email,
  //   })
});

module.exports = router;
