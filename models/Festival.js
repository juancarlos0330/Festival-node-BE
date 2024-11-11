const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FestivalSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  beginDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

module.exports = Festival = mongoose.model("festivals", FestivalSchema);
