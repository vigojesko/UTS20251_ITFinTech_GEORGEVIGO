import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, 
  description: { type: String }, 
});

// Hindari re-declare model kalau sudah ada
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);