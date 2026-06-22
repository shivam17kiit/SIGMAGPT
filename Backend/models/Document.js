import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    fileName: String,
    chunks: [String]
});


export default mongoose.model(
    "Document",
    DocumentSchema
);