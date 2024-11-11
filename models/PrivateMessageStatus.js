const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PrivateMessageStatusSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  unReadMessageCount: {
    type: Number,
    default: 0,
  },
});

module.exports = PrivateMessageStatus = mongoose.model(
  "privatemessagestatuses",
  PrivateMessageStatusSchema
);
