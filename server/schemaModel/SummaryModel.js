// models/Summary.js
import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    default: "Please summarize this text in a clear and concise manner.",
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const SummarySchemaModel = mongoose.model("summarySchema", summarySchema);
export default SummarySchemaModel;
