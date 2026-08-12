import express from "express";
import mongoose from "mongoose";
import recordRoutes from "./routes/records.js";
import cors from "cors";

// ...
import dotenv from "dotenv";
dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", // Live Server
      "http://localhost:5173", // Vite React App
    ],
  }),
);

// Routes
app.use("/api/record", recordRoutes);
// ..........fallback
app.use((req, res) => {
  res.status(404).json({ msng: "Route not available" });
});

// Database and server
const PORT = process.env.PORT || 8080;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongodb connected");
    app.listen(PORT, () => {
      console.log(`Server is listening to the port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to mongodb: ", err.stack);
  });
