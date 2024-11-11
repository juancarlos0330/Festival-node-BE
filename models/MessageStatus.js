const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MessageStatusSchema = new Schema({
  festival: {
    type: Schema.Types.ObjectId,
    ref: "festivals",
  },
  unReadUsers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      unReadCount: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = MessageStatus = mongoose.model(
  "messagestatuses",
  MessageStatusSchema
);
