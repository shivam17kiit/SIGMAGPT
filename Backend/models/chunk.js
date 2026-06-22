import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema({
    documentId: String,
    text: String,
    embedding: [Number]
});

export default mongoose.model(
    "Chunk",
    ChunkSchema
);