const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");

const app = express();

/* Environment Variables */

const PORT = process.env.APP_PORT || 8090;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

/* MongoDB Connection */

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* Redis Connection */

const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

redisClient
  .connect()
  .then(() => console.log("✅ Redis connected"))
  .catch((err) => console.error("❌ Redis connection error:", err));

/* Routes */

app.get("/", async (req, res) => {
  try {
    await redisClient.set("message", "the application is running");
    const message = await redisClient.get("message");

    res.json({
      message: message,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redisClient.isOpen ? "connected" : "disconnected",
  });
});

/* Start Server */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
