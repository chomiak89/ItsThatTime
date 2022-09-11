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
  minute: Number,
  hour: Number,
  day: Number,
  month: Number,
  displayMinute: String,
  displayHour: String,
  displayDay: String,
  displayMonth: String,
});

const Reminder = mongoose.model("Reminder", ReminderSchema);

module.exports = Reminder;
