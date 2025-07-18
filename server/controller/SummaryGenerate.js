import dotenv from "dotenv";
import OpenAI from "openai";
import SummarySchemaModel from "../schemaModel/SummaryModel.js";
import AuthModelData from "../schemaModel/AuthSchemaModel.js";
import mammoth from "mammoth";
import mongoose from "mongoose";
import fs from "fs";
import Redis from "ioredis";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Redis and Cache Configuration
let redis = null;
let isRedisConnected = false;
let useInMemoryCache = false;
const inMemoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;
const CACHE_TTL = 3600; // 1 hour

// Initialize Redis
const initializeRedis = async () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 3000,
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
      isRedisConnected = true;
      useInMemoryCache = false;
    });

    redis.on("error", (err) => {
      console.warn("Redis connection failed, using in-memory cache");
      isRedisConnected = false;
      useInMemoryCache = true;
      if (redis) {
        redis.disconnect();
        redis = null;
      }
    });

    redis.on("close", () => {
      isRedisConnected = false;
      useInMemoryCache = true;
    });

    await redis.ping();
    isRedisConnected = true;
    console.log("Redis is ready");
  } catch (error) {
    console.warn("Redis initialization failed, using in-memory cache");
    redis = null;
    isRedisConnected = false;
    useInMemoryCache = true;
  }
};

initializeRedis();

// Cache Helper Functions
const getCacheKey = (prefix, userId, additionalParams = {}) => {
  const sortedParams = Object.keys(additionalParams)
    .sort()
    .map((key) => `${key}:${additionalParams[key]}`)
    .join("|");
  return `${prefix}:${userId}${sortedParams ? ":" + sortedParams : ""}`;
};

const safeRedisOperation = async (operation) => {
  if (redis && isRedisConnected) {
    try {
      return await operation();
    } catch (error) {
      console.warn("Redis operation failed, switching to in-memory cache");
      isRedisConnected = false;
      useInMemoryCache = true;
      return null;
    }
  }
  return null;
};

// In-Memory Cache Functions
const setInMemoryCache = (key, value, ttl = CACHE_TTL) => {
  if (inMemoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
    const firstKey = inMemoryCache.keys().next().value;
    inMemoryCache.delete(firstKey);
  }
  const expiresAt = Date.now() + ttl * 1000;
  inMemoryCache.set(key, { value, expiresAt });
};

const getInMemoryCache = (key) => {
  const cached = inMemoryCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return cached.value;
};

// Unified Cache Operations
const getFromCache = async (key) => {
  if (isRedisConnected && redis) {
    const result = await safeRedisOperation(() => redis.get(key));
    return result;
  } else if (useInMemoryCache) {
    return getInMemoryCache(key);
  }
  return null;
};

const setCache = async (key, value, ttl = CACHE_TTL) => {
  if (isRedisConnected && redis) {
    await safeRedisOperation(() => redis.setex(key, ttl, value));
  } else if (useInMemoryCache) {
    setInMemoryCache(key, value, ttl);
  }
};

// FIXED: Universal Cache Invalidation - Role Independent
const invalidateAllCache = async (summaryId = null) => {
  try {
    console.log(
      `🔄 Invalidating all cache${
        summaryId ? ` for summary: ${summaryId}` : ""
      }`
    );

    if (isRedisConnected && redis) {
      const patterns = ["summaries:*", "summary:*"];

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(
            `✅ Redis: Deleted ${keys.length} cache keys for pattern: ${pattern}`
          );
        }
      }
    } else if (useInMemoryCache) {
      const keysToDelete = [];
      for (const key of inMemoryCache.keys()) {
        if (key.startsWith("summaries:")) {
          keysToDelete.push(key);
        }

        if (summaryId && key === `summary:${summaryId}`) {
          keysToDelete.push(key);
        }

        if (!summaryId && key.startsWith("summary:")) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => {
        inMemoryCache.delete(key);
        console.log(`🗑️ Deleted cache key: ${key}`);
      });

      console.log(`✅ Memory: Deleted ${keysToDelete.length} cache keys`);
    }
  } catch (error) {
    console.error("❌ Cache invalidation error:", error);
  }
};

// FIXED: Update cache with fresh data for all users
const updateCacheWithFreshData = async (summaryId = null) => {
  try {
    console.log(
      `🔄 Updating cache with fresh data${
        summaryId ? ` for summary: ${summaryId}` : ""
      }`
    );

    if (summaryId) {
      const summary = await SummarySchemaModel.findById(summaryId);
      if (summary) {
        const cacheKey = `summary:${summaryId}`;
        await setCache(cacheKey, JSON.stringify(summary));
        console.log(`✅ Updated individual summary cache: ${cacheKey}`);
      }
    }

    const allUsers = await AuthModelData.find({}, { _id: 1, role: 1 });

    const commonQueries = [
      { status: undefined, limit: 10, page: 1 },
      { status: "draft", limit: 10, page: 1 },
      { status: "published", limit: 10, page: 1 },
    ];

    for (const user of allUsers) {
      for (const queryParams of commonQueries) {
        const cacheKey = getCacheKey("summaries", user._id, queryParams);

        // Query fresh data
        const query = {};
        if (queryParams.status) {
          query.status = queryParams.status;
        }
        if (user.role === "user") {
          query.userId = user._id;
        }

        const summaries = await SummarySchemaModel.find(query)
          .sort({ createdAt: -1 })
          .limit(queryParams.limit * 1)
          .skip((queryParams.page - 1) * queryParams.limit)
          .select("-originalText");

        const total = await SummarySchemaModel.countDocuments(query);

        const responseData = {
          summaries,
          totalPages: Math.ceil(total / queryParams.limit),
          currentPage: queryParams.page,
          total,
          userRole: user.role,
          timestamp: Date.now(),
        };

        await setCache(cacheKey, JSON.stringify(responseData));
        console.log(
          `✅ Updated summaries cache for user ${user._id}: ${cacheKey}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Cache update error:", error);
  }
};

// Generate Summary
const generateSummary = async (req, res) => {
  try {
    let textToSummarize = "";
    let fileName = null;
    let fileType = "text";
    const prompt =
      req.body.prompt ||
      "Please summarize this text in a clear and concise manner.";
    const userId = req.body.userId || req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    // Check user credits
    const userCreditCheck = await AuthModelData.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          credits: 1,
          userName: 1,
          hasCredits: { $gt: ["$credits", 0] },
        },
      },
    ]);

    if (!userCreditCheck || userCreditCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userCreditCheck[0];
    if (!user.hasCredits) {
      return res.status(403).json({
        error: "update you plan or add credit",
        message:
          "You have no credits remaining. Please purchase more credits to generate summaries.",
        currentCredits: user.credits,
        needsTopUp: true,
      });
    }

    // Process file or text
    if (req.file) {
      fileName = req.file.originalname;
      fileType = "file";

      try {
        if (!fs.existsSync(req.file.path)) {
          return res.status(400).json({ error: "Uploaded file not found" });
        }

        if (req.file.mimetype === "text/plain") {
          textToSummarize = fs.readFileSync(req.file.path, "utf8");
        } else if (
          req.file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const result = await mammoth.extractRawText({ path: req.file.path });
          textToSummarize = result.value;
        } else {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: "Unsupported file type" });
        }

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (fileError) {
        console.error("File processing error:", fileError);
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error cleaning up file:", unlinkError);
          }
        }
        return res
          .status(500)
          .json({ error: "Error processing uploaded file" });
      }
    } else {
      textToSummarize = req.body.text;
    }

    if (!textToSummarize || textToSummarize.trim() === "") {
      return res
        .status(400)
        .json({ error: "No text provided for summarization" });
    }

    // Deduct credit
    const updatedUser = await AuthModelData.findByIdAndUpdate(
      userId,
      { $inc: { credits: -1 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Failed to update user credits" });
    }

    try {
      // Generate summary using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates clear and concise summaries.",
          },
          {
            role: "user",
            content: `${prompt}\n\nText to summarize:\n${textToSummarize}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const summary = completion.choices[0].message.content;

      // Only invalidate cache after generating summary
      await invalidateAllCache();

      res.json({
        summary: summary,
        originalText: textToSummarize,
        fileName: fileName,
        fileType: fileType,
        wordCount: textToSummarize
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
        remainingCredits: updatedUser.credits,
        message: `Summary generated successfully. You have ${updatedUser.credits} credits remaining.`,
      });
    } catch (openaiError) {
      // Refund credit if OpenAI fails
      await AuthModelData.findByIdAndUpdate(userId, { $inc: { credits: 1 } });
      console.error("OpenAI error:", openaiError);
      return res
        .status(500)
        .json({ error: "Failed to generate summary with AI service" });
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error cleaning up file:", unlinkError);
      }
    }
    res.status(500).json({
      error: "Failed to generate summary",
      details: error.message,
    });
  }
};

// FIXED: Save Summary - Role Independent
const saveSummary = async (req, res) => {
  try {
    const {
      title,
      content,
      originalText,
      prompt,
      status,
      fileName,
      fileType,
      userId,
    } = req.body;

    if (!title || !content || !originalText) {
      return res
        .status(400)
        .json({ error: "Title, content, and original text are required" });
    }

    const totalWords = content.trim().split(/\s+/).length;
    const summary = new SummarySchemaModel({
      title,
      content,
      originalText,
      prompt,
      status: status || "draft",
      fileName,
      fileType: fileType || "text",
      userId,
      wordCount: totalWords,
    });

    await summary.save();

    await invalidateAllCache(summary._id);
    await updateCacheWithFreshData(summary._id);

    console.log(
      `✅ Summary saved and ALL cache updated for summary: ${summary._id}`
    );

    res.status(201).json({
      message: "Summary saved successfully",
      summary: summary,
    });
  } catch (error) {
    console.error("Error saving summary:", error);
    res.status(500).json({ error: "Failed to save summary" });
  }
};

// Get All Summaries
const getAllSummaries = async (req, res) => {
  try {
    const { status, limit = 10, page = 1, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const cacheKey = getCacheKey("summaries", userId, { status, limit, page });
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      console.log("✅ Cache hit for summaries:", cacheKey);
      return res.json(JSON.parse(cachedData));
    }

    console.log("🔍 Cache miss, querying database:", cacheKey);

    const user = await AuthModelData.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = {};
    if (status) {
      query.status = status;
    }
    if (user.role === "user") {
      query.userId = userId;
    }

    const summaries = await SummarySchemaModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-originalText");

    const total = await SummarySchemaModel.countDocuments(query);

    const responseData = {
      summaries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      userRole: user.role,
      timestamp: Date.now(),
    };

    await setCache(cacheKey, JSON.stringify(responseData), CACHE_TTL);
    console.log(`✅ Cached fresh data: ${cacheKey}`);

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
};

// Get Summary by ID
const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `summary:${id}`;

    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log("✅ Cache hit for summary:", cacheKey);
      return res.json(JSON.parse(cachedData));
    }

    console.log("🔍 Cache miss, querying database:", cacheKey);

    const summary = await SummarySchemaModel.findById(id);
    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    await setCache(cacheKey, JSON.stringify(summary));
    console.log(`✅ Cached individual summary: ${cacheKey}`);

    res.json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

// FIXED: Update Summary - Role Independent
const updateSummary = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const { id } = req.params;

    const existingSummary = await SummarySchemaModel.findById(id);
    if (!existingSummary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    const summary = await SummarySchemaModel.findByIdAndUpdate(
      id,
      { title, content, status },
      { new: true, runValidators: true }
    );

    await invalidateAllCache(id);
    await updateCacheWithFreshData(id);

    console.log(
      `✅ Summary updated and ALL cache refreshed for summary: ${id}`
    );

    res.json({
      message: "Summary updated successfully",
      summary,
    });
  } catch (error) {
    console.error("Error updating summary:", error);
    res.status(500).json({ error: "Failed to update summary" });
  }
};

// FIXED: Delete Summary - Role Independent
const deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await SummarySchemaModel.findById(id);
    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    await SummarySchemaModel.findByIdAndDelete(id);

    await invalidateAllCache();
    await updateCacheWithFreshData();

    console.log(
      `✅ Summary deleted and ALL cache refreshed for summary: ${id}`
    );

    res.json({ message: "Summary deleted successfully" });
  } catch (error) {
    console.error("Error deleting summary:", error);
    res.status(500).json({ error: "Failed to delete summary" });
  }
};

export default {
  generateSummary,
  saveSummary,
  getAllSummaries,
  getSummaryById,
  updateSummary,
  deleteSummary,
};
