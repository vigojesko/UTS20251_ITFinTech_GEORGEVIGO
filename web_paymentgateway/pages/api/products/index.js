import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const products = await Product.find({});
      return res.status(200).json({ success: true, data: products });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}