import dbConnect from "@/Lib/mongodb";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const checkout = await Checkout.findById(id);
      
      if (!checkout) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      return res.status(200).json({ success: true, data: checkout });
    } catch (error) {
      console.error("Error fetching order:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}