// /pages/api/analytics/summary.js
import dbConnect from '../../../Lib/mongodb';
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ success:false, message:"Method not allowed" });
  try {
    await dbConnect();

    const totalPaidAgg = await Checkout.aggregate([
      { $match: { status: { $in: ["PAID", "PENDING_PAYMENT", "CREATED"] } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    const totalOmzet = totalPaidAgg[0]?.total || 0;
    const totalOrders = totalPaidAgg[0]?.count || 0;

    const last7Days = await Checkout.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          omzet: { $sum: "$amount" },
          orders: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const byStatus = await Checkout.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: { totalOmzet, totalOrders, last7Days, byStatus }
    });
  } catch (e) {
    console.error("❌ analytics/summary:", e);
    return res.status(500).json({ success:false, message:"Server error" });
  }
}