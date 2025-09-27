import axios from "axios";
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await dbConnect(); // koneksi ke MongoDB

      const { cart, total } = req.body;
      const external_id = "order-" + Date.now();

      // Buat invoice di Xendit dengan redirect URL
      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id,
          amount: total,
          payer_email: "customer@example.com",
          description: "Pembayaran order di web_paymentgateway",
          // redirect URL setelah bayar
          success_redirect_url:
            process.env.NEXT_PUBLIC_BASE_URL + "/payment-success",
          failure_redirect_url:
            process.env.NEXT_PUBLIC_BASE_URL + "/payment-failed",
        },
        {
          auth: {
            username: process.env.XENDIT_SECRET_KEY,
            password: "",
          },
        }
      );

      const invoiceData = response.data;

      // Simpan Checkout
      await Checkout.create({
        xenditInvoiceId: invoiceData.id,
        external_id,
        status: "PENDING",
        amount: total,
        items: cart,
        invoice_url: invoiceData.invoice_url,
        expires_at: invoiceData.expiry_date,
      });

      // Simpan Payment
      await Payment.create({
        invoiceId: invoiceData.id,
        external_id,
        status: "PENDING",
        amount: total,
        raw: invoiceData,
      });

      console.log(`✅ Invoice ${invoiceData.id} berhasil dibuat.`);
      return res.status(200).json({ success: true, invoice: invoiceData });
    } catch (err) {
      console.error("❌ Error create invoice:", err.response?.data || err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}