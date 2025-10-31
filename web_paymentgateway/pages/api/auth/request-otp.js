// pages/api/auth/request-otp.js
import { generateOTP, sendOTP, validatePhoneNumber, formatPhoneNumber } from "../../../lib/fonnte";

// In-memory storage untuk OTP (production: gunakan Redis atau Database)
const otpStore = new Map();

// 🔥 FIX: Perpanjang expiry dari 5 menit jadi 30 menit
const OTP_EXPIRY_MINUTES = 30; // Ubah ini sesuai kebutuhan

// Cleanup expired OTP setiap 1 menit
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now - data.timestamp > OTP_EXPIRY_MINUTES * 60 * 1000) {
      otpStore.delete(phone);
    }
  }
}, 60 * 1000);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  try {
    const { phoneNumber } = req.body;

    // Validasi input
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: "Nomor telepon harus diisi" 
      });
    }

    // Validasi format nomor
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: "Format nomor telepon tidak valid. Gunakan format: 08xxx atau 628xxx" 
      });
    }

    // Format nomor ke format WhatsApp
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Rate limiting: Max 3 request per 10 menit per nomor
    const existingOTP = otpStore.get(formattedPhone);
    if (existingOTP && existingOTP.attemptCount >= 3) {
      const timeSinceFirst = Date.now() - existingOTP.firstAttempt;
      if (timeSinceFirst < 10 * 60 * 1000) { // 10 menit
        return res.status(429).json({ 
          success: false, 
          error: "Terlalu banyak permintaan OTP. Coba lagi nanti." 
        });
      } else {
        // Reset counter setelah 10 menit
        otpStore.delete(formattedPhone);
      }
    }

    // Generate OTP 6 digit
    const otp = generateOTP();
    
    // Kirim OTP via WhatsApp (Fonnte)
    const sendResult = await sendOTP(formattedPhone, otp);
    
    if (!sendResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: "Gagal mengirim OTP ke WhatsApp. " + sendResult.error 
      });
    }

    // Simpan OTP di memory dengan expiry time
    const otpData = {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0,
      attemptCount: existingOTP ? existingOTP.attemptCount + 1 : 1,
      firstAttempt: existingOTP ? existingOTP.firstAttempt : Date.now(),
      expiresAt: Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000) // 🔥 Tambah field ini
    };
    
    otpStore.set(formattedPhone, otpData);

    // Log untuk debugging (JANGAN TAMPILKAN OTP DI PRODUCTION!)
    console.log(`📱 OTP sent to ${formattedPhone}: ${otp} (Expires in ${OTP_EXPIRY_MINUTES} minutes)`);

    return res.status(200).json({ 
      success: true, 
      message: "Kode OTP berhasil dikirim ke WhatsApp",
      phoneNumber: formattedPhone,
      // HANYA UNTUK DEVELOPMENT - HAPUS DI PRODUCTION
      debug: process.env.NODE_ENV === 'development' ? { 
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES
      } : undefined
    });

  } catch (error) {
    console.error("Error requesting OTP:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan server" 
    });
  }
}

// Export untuk keperluan verify
export { otpStore };