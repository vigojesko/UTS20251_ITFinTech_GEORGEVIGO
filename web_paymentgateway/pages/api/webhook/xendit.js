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
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Validasi token callback dari Xendit
  const token = req.headers["x-callback-token"];
  if (!token || token !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.log("❌ Webhook ditolak karena token salah:", token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body;
  console.log("✅ Webhook diterima, payload:", JSON.stringify(payload, null, 2));

  const invoiceId = payload.id || payload.invoice_id;
  const status = payload.status;

  try {
    // Update Payment dengan data lengkap dari webhook
    let payment = await Payment.findOne({ invoiceId });
    
    if (payment) {
      // Update payment yang sudah ada
      payment.status = status;
      payment.external_id = payload.external_id || payment.external_id;
      payment.user_id = payload.user_id;
      payment.paid_amount = payload.paid_amount;
      payment.paid_at = payload.paid_at;
      payment.payment_method = payload.payment_method;
      payment.payment_channel = payload.payment_channel;
      payment.payment_id = payload.payment_id;
      payment.payment_method_id = payload.payment_method_id;
      payment.merchant_name = payload.merchant_name;
      payment.description = payload.description;
      payment.currency = payload.currency;
      payment.payer_email = payload.payer_email;
      payment.is_high = payload.is_high;
      payment.created = payload.created;
      payment.updated = payload.updated;
      payment.payment_details = payload.payment_details || {};
      payment.raw = payload; // Simpan semua data webhook
      
      await payment.save();
      console.log(`💾 Payment ${invoiceId} diupdate ke status: ${status}`);
    } else {
      // Buat payment baru jika belum ada
      payment = await Payment.create({
        invoiceId,
        external_id: payload.external_id,
        user_id: payload.user_id,
        status,
        amount: payload.amount,
        paid_amount: payload.paid_amount,
        paid_at: payload.paid_at,
        payment_method: payload.payment_method,
        payment_channel: payload.payment_channel,
        payment_id: payload.payment_id,
        payment_method_id: payload.payment_method_id,
        merchant_name: payload.merchant_name,
        description: payload.description,
        currency: payload.currency,
        payer_email: payload.payer_email,
        is_high: payload.is_high,
        created: payload.created,
        updated: payload.updated,
        payment_details: payload.payment_details || {},
        raw: payload,
      });
      console.log(`🆕 Payment ${invoiceId} dibuat dengan status: ${status}`);
    }

    // Update checkout status jika pembayaran berhasil
    if (status === "PAID") {
      const updatedCheckout = await Checkout.findOneAndUpdate(
        { xenditInvoiceId: invoiceId },
        {
          status: "PAID",
          paid_at: payload.paid_at || new Date(),
        },
        { new: true }
      );

      if (updatedCheckout) {
        console.log(`🎉 Checkout ${invoiceId} diupdate ke PAID`);
        
        // Di sini Anda bisa tambahkan logic lain seperti:
        // - Kirim email confirmation
        // - Update inventory
        // - Trigger fulfillment process
        
      } else {
        console.log(`⚠️ Checkout dengan invoice ${invoiceId} tidak ditemukan`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}