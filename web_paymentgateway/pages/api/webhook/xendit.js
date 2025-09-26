import dbConnect from "@/lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    console.log("❌ Webhook dipanggil dengan method bukan POST");
    return res.status(405).end();
  }

  const token = req.headers["x-callback-token"];
  if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.log("❌ Webhook ditolak karena token salah:", token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body;
  console.log("✅ Webhook diterima, payload:", JSON.stringify(payload, null, 2));

  const invoiceId = payload.id || payload.invoice_id;
  const status = payload.status;

  try {
    const payment = await Payment.findOne({ invoiceId });
    if (payment) {
      payment.status = status;
      payment.raw = payload;
      await payment.save();
      console.log(`💾 Payment ${invoiceId} diupdate ke status: ${status}`);

      if (status === "PAID") {
        await Checkout.findOneAndUpdate(
          { xenditInvoiceId: invoiceId },
          { status: "PAID" }
        );
        console.log(`🎉 Checkout ${invoiceId} diupdate ke PAID`);
      }
    } else {
      console.log("⚠️ Tidak ditemukan Payment dengan invoiceId:", invoiceId);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}