import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import router from "./route/app.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import xss from "xss";
import mongoSanitizeMiddleware from "./middleware/mongoSanitize.js";
import { initializeCronJobs } from "./services/cronService.js";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "OPENAI_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  console.error("\nPlease create a .env file with the required variables:");
  console.error("DATABASE_URL=your_mongodb_connection_string");
  console.error("OPENAI_API_KEY=your_openai_api_key");
  console.error("PORT=8000 (optional)");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8000;

app.use(mongoSanitizeMiddleware);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const sanitizeBody = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};
app.use(sanitizeBody);

// ✅ HTTP param pollution protection
app.use(hpp());
app.use(cookieParser());
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Your existing routes
app.use("/v1", router);

// ✅ MongoDB connection
const connect = async () => {
  const URL = process.env.DATABASE_URL;
  try {
    await mongoose.connect(URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    initializeCronJobs();
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// ✅ Start server
app.listen(PORT, () => {
  connect();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 MCP Server available at http://localhost:${PORT}/mcp`);
});
