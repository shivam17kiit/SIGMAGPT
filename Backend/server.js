import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/api", chatRoutes);
app.use("/auth", authRoutes);
app.use("/document", documentRoutes);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch (err) {
        console.log("Failed to connect with Db", err.message);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});