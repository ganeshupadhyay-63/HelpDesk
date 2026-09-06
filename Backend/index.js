import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import categoryRoute from "./routes/category.route.js";
import providerRoute from "./routes/provider.route.js";
import serviceRoute from "./routes/service.route.js";
import searchRoute from "./routes/search.route.js";
import serviceRequestRoute from "./routes/serviceRequest.route.js";
import notificationRoutes from "./routes/notification.route.js";
import customerRoutes from "./routes/customer.route.js";

dotenv.config();

const app = express();

// Database
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoute);
app.use("/api/customer", customerRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/provider", providerRoute);
app.use("/api/service", serviceRoute);
app.use("/api/search", searchRoute);
app.use("/api/service-request", serviceRequestRoute);
app.use("/api/notification", notificationRoutes);


// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Local Service Platform API is running",
  });
});

// ===============================
// Server
// ===============================

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
