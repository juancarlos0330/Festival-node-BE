const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GlobalChatSchema = new Schema({
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

module.exports = GlobalChat = mongoose.model("globalchats", GlobalChatSchema);
