// /pages/api/auth/send-otp.js
import dbConnect from "../../../Lib/mongodb";
import User from "../../../models/user";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Nomor WA wajib diisi" });

  try {
    await dbConnect();

    // Generate OTP random 6 digit
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan kode OTP ke DB user
    const user = await User.findOneAndUpdate(
      { phone },
      { otpCode },
      { new: true, upsert: true }
    );

    // Kirim via Twilio WhatsApp (contoh)
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH;
    const client = require("twilio")(accountSid, authToken);

    await client.messages.create({
      from: "whatsapp:+14155238886", // nomor Twilio WA
      to: `whatsapp:${phone}`,
      body: `Kode OTP login kamu adalah ${otpCode}. Berlaku 5 menit.`
    });

    return res.status(200).json({ success: true, message: "OTP terkirim" });
  } catch (err) {
    console.error("❌ send-otp error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengirim OTP" });
  }
}