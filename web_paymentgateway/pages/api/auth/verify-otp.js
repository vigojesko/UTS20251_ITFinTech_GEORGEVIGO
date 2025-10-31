// pages/api/auth/verify-otp.js
import { formatPhoneNumber } from "../../../lib/fonnte";
import { otpStore } from "./request-otp";

// 🔥 FIX: Perpanjang expiry dari 5 menit jadi 30 menit
const OTP_EXPIRY_MINUTES = 30;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  try {
    const { phoneNumber, otp, fullName, action } = req.body;
    
    // 🔥 DEBUG LOG
    console.log("📥 [VERIFY-OTP] Request received:", {
      phoneNumber,
      otp: otp ? `${otp.substring(0, 2)}****` : 'undefined',
      fullName,
      action
    });

    // Validasi input
    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: "Nomor telepon dan OTP harus diisi" 
      });
    }

    if (action === "register" && !fullName) {
      return res.status(400).json({ 
        success: false, 
        error: "Nama lengkap harus diisi untuk registrasi" 
      });
    }

    // Format nomor
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log("📞 [VERIFY-OTP] Formatted phone:", formattedPhone);

    // Ambil OTP dari store
    const storedOTPData = otpStore.get(formattedPhone);

    // Validasi OTP exists
    if (!storedOTPData) {
      console.log("❌ [VERIFY-OTP] OTP not found in store");
      return res.status(400).json({ 
        success: false, 
        error: "OTP tidak ditemukan atau sudah expired. Minta OTP baru." 
      });
    }

    // 🔥 DEBUG: Check expiry calculation
    const now = Date.now();
    const timePassed = now - storedOTPData.timestamp;
    const timePassedMinutes = Math.floor(timePassed / 1000 / 60);
    
    console.log("⏱️ [VERIFY-OTP] Time check:", {
      timePassedMinutes,
      expiryMinutes: OTP_EXPIRY_MINUTES,
      isExpired: timePassed > (OTP_EXPIRY_MINUTES * 60 * 1000)
    });

    // 🔥 FIX: Check expiry dengan 30 menit
    const expiryTime = OTP_EXPIRY_MINUTES * 60 * 1000; // 30 menit
    
    if (timePassed > expiryTime) {
      console.log("❌ [VERIFY-OTP] OTP expired");
      otpStore.delete(formattedPhone);
      return res.status(400).json({ 
        success: false, 
        error: "OTP sudah expired. Minta OTP baru." 
      });
    }

    // Validasi max attempts (3 kali salah)
    if (storedOTPData.attempts >= 3) {
      console.log("❌ [VERIFY-OTP] Max attempts reached");
      otpStore.delete(formattedPhone);
      return res.status(400).json({ 
        success: false, 
        error: "Terlalu banyak percobaan gagal. Minta OTP baru." 
      });
    }

    // Validasi OTP match
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts += 1;
      otpStore.set(formattedPhone, storedOTPData);
      
      console.log(`❌ [VERIFY-OTP] Wrong OTP. Attempts: ${storedOTPData.attempts}/3`);
      
      return res.status(400).json({ 
        success: false, 
        error: `Kode OTP salah. Sisa percobaan: ${3 - storedOTPData.attempts}` 
      });
    }

    // OTP Valid! Hapus dari store
    otpStore.delete(formattedPhone);
    console.log("✅ [VERIFY-OTP] OTP verified successfully");

    // PRODUCTION: Simpan ke database
    // Untuk demo, kita return data user
    
    if (action === "register") {
      const newUser = {
        id: `user_${Date.now()}`,
        phoneNumber: formattedPhone,
        fullName: fullName,
        email: `${formattedPhone}@whatsapp.user`,
        role: "user",
        photo: "",
        createdAt: new Date().toISOString(),
        isPhoneVerified: true
      };

      const token = `token_${newUser.id}_${Date.now()}`;

      console.log("✅ [VERIFY-OTP] User registered:", newUser.id);

      return res.status(200).json({ 
        success: true, 
        message: "Registrasi berhasil!",
        user: newUser,
        token: token
      });
    } 
    
    else if (action === "login") {
      const existingUser = {
        id: `user_${formattedPhone}`,
        phoneNumber: formattedPhone,
        fullName: "User VIGWAGON",
        email: `${formattedPhone}@whatsapp.user`,
        role: "user",
        photo: "",
        isPhoneVerified: true
      };

      const token = `token_${existingUser.id}_${Date.now()}`;

      console.log("✅ [VERIFY-OTP] User logged in:", existingUser.id);

      return res.status(200).json({ 
        success: true, 
        message: "Login berhasil!",
        user: existingUser,
        token: token
      });
    }

    return res.status(400).json({ 
      success: false, 
      error: "Invalid action" 
    });

  } catch (error) {
    console.error("❌ [VERIFY-OTP] Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan server" 
    });
  }
}