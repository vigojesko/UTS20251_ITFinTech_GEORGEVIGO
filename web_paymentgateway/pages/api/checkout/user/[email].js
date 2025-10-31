import dbConnect from "@/Lib/mongodb";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  const { email } = req.query;

  if (req.method === "GET") {
    try {
      const checkouts = await Checkout.find({ 
        "customer_info.email": email 
      }).sort({ createdAt: -1 }); // Sort terbaru dulu

      return res.status(200).json({ 
        success: true, 
        data: checkouts,
        total: checkouts.length 
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}