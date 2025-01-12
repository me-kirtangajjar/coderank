const mongoose = require("mongoose");

const executionSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ["javascript", "python", "cpp"],
  },
  code: {
    type: String,
    required: true,
  },
  output: String,
  error: String,
  executionTime: Number,
  status: {
    type: String,
    enum: ["success", "error"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Execution", executionSchema);
