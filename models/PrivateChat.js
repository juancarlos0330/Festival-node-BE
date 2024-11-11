const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PrivateChatSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  message: {
    type: String,
    required: true,
  },
  created_date: {
    type: Date,
    required: true,
  },
});

module.exports = PrivateChat = mongoose.model(
  "privatechats",
  PrivateChatSchema
);
