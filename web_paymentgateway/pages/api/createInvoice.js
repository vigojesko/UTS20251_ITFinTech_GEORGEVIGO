import axios from "axios";
import dbConnect from "@/Lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const { cart, total, userEmail, userName } = req.body;
      
      // VALIDASI: Pastikan total ada dan bukan 0
      if (!total || total === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Total amount tidak boleh 0" 
        });
      }

      const external_id = "order-" + Date.now();

      console.log("💰 Creating invoice with amount:", total); // DEBUG LOG

      // Buat invoice di Xendit
      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id,
          amount: total, // Pastikan total dikirim
          payer_email: userEmail || "customer@example.com",
          description: `Pembayaran oleh ${userName || "Customer"}`,
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

      // Simpan Checkout dengan amount yang benar
      const checkout = await Checkout.create({
        xenditInvoiceId: invoiceData.id,
        external_id,
        status: "PENDING_PAYMENT",
        amount: total, // PENTING: Simpan total di sini
        items: cart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty
        })),
        invoice_url: invoiceData.invoice_url,
        expires_at: invoiceData.expiry_date,
        customer_info: {
          email: userEmail || "customer@example.com",
          name: userName || "Customer"
        },
        userEmail: userEmail || "customer@example.com" // Tambahkan ini untuk backward compatibility
      });

      console.log("✅ Checkout created:", checkout); // DEBUG LOG

      await Payment.create({
        invoiceId: invoiceData.id,
        external_id,
        status: "PENDING",
        amount: total,
        raw: invoiceData,
      });

      console.log(`✅ Invoice ${invoiceData.id} berhasil dibuat dengan amount: Rp${total}`);
      return res.status(200).json({ success: true, invoice: invoiceData });
    } catch (err) {
      console.error("❌ Error create invoice:", err.response?.data || err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}