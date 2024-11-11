const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FestivalJoinStatusSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  festival: {
    type: Schema.Types.ObjectId,
    ref: "festivals",
  },
  status: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = FestivalJoinStatus = mongoose.model(
  "festivaljoinstatuses",
  FestivalJoinStatusSchema
);
