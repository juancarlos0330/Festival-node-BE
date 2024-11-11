const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GroupChatSchema = new Schema({
  festival: {
    type: Schema.Types.ObjectId,
    ref: "festivals",
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

module.exports = GroupChat = mongoose.model("groupchats", GroupChatSchema);
