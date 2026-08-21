import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(clerkMiddleware());

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QuizForge API is running",
  });
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`QuizForge server running on port ${PORT}`);
});

connectDB();