const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
  },
  number: {
    type: String,
  },
});

const Reminder = mongoose.model("Reminder", ReminderSchema);

module.exports = Reminder;
