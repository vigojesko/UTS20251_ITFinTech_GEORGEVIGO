// /pages/api/checkout/list.js
import dbConnect from "../../../Lib/mongodb";
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const checkouts = await Checkout.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Pastikan setiap transaksi punya total berdasarkan 'amount'
    const formatted = checkouts.map(c => ({
      ...c,
      total: c.amount || 0,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ GET /api/checkout/list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}