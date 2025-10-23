import dbConnect from "@/Lib/mongodb";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // Test koneksi dengan menghitung data
    const paymentCount = await Payment.countDocuments();
    const checkoutCount = await Checkout.countDocuments();
    
    // Test query data terbaru
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceId status amount createdAt');

    const recentCheckouts = await Checkout.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('external_id status amount createdAt');

    res.status(200).json({
      success: true,
      message: "MongoDB Atlas connection successful!",
      stats: {
        payments: paymentCount,
        checkouts: checkoutCount
      },
      recent: {
        payments: recentPayments,
        checkouts: recentCheckouts
      }
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}