import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import router from './route/app.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import xss from 'xss';
import mongoSanitizeMiddleware from './middleware/mongoSanitize.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

// ✅ Use sanitize middleware
app.use(mongoSanitizeMiddleware);
// ✅ Secure HTTP headers
app.use(helmet());
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://techhive.localhost:5173',
//      "http://grocerypoint.localhost:5173",
//       /\.localhost$/, 
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
// }));
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // allow all origins (for dev/local)
    },
    credentials: true, // this is must for sending cookies
  })
);

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
});
app.use(limiter);
app.use(express.json());
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};
app.use(sanitizeBody);

// ✅ HTTP param pollution protection
app.use(hpp());

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Routes
app.use("/v1", router);

// ✅ MongoDB connection
const connect = async () => {
  const URL = process.env.DATABASE_URL;
  try {
    await mongoose.connect(URL);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

// ✅ Start server
app.listen(PORT, () => {
  connect();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

