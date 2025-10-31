import dbConnect from "@/Lib/mongodb";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === "GET") {
      const checkouts = await Checkout.find({}).sort({ createdAt: -1 });
      
      return res.status(200).json({ 
        success: true, 
        data: checkouts || [],
        total: checkouts ? checkouts.length : 0
      });
    } else {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error("❌ Error in /api/checkout:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [] // Return empty array on error
    });
  }
}