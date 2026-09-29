const mongoose = require("mongoose");

// שומרים את החיבור ב-global כדי שלא ייווצר חיבור חדש בכל בקשה (חשוב ב-Vercel / serverless)
const cache = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in environment variables");

  if (!cache.promise) cache.promise = mongoose.connect(uri);

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}

module.exports = connectDB;
