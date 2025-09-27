import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

console.log("🔍 MONGODB_URL dari env:", MONGODB_URL);
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);

if (!MONGODB_URL) {
  throw new Error("Please define MONGODB_URL in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("🔗 Attempting to connect to:", MONGODB_URL);
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "uts_payment",
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected successfully");
  return cached.conn;
}

export default dbConnect;