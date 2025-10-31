// lib/fonnte.js
// Utility untuk integrasi Fonnte WhatsApp API

const FONNTE_API_URL = "https://api.fonnte.com/send";

// Ganti dengan token Fonnte Anda
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "YOUR_FONNTE_TOKEN_HERE";

/**
 * Kirim OTP ke WhatsApp menggunakan Fonnte
 * @param {string} phoneNumber - Nomor WhatsApp (format: 628xxx)
 * @param {string} otp - Kode OTP 6 digit
 * @returns {Promise<Object>} Response dari Fonnte API
 */
export async function sendOTP(phoneNumber, otp) {
  try {
    const message = `🔐 *VIGWAGON - Kode Verifikasi*\n\nHalo! Kode OTP kamu adalah: *${otp}*\n\nBerlaku selama *5 menit*. Jangan bagikan ke siapa pun.\n\n_Terima kasih telah menggunakan VIGWAGON!_`;

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": FONNTE_TOKEN
      },
      body: JSON.stringify({
        target: phoneNumber,
        message: message,
        countryCode: "62" // Indonesia
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.reason || "Gagal mengirim OTP");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Kirim notifikasi checkout ke WhatsApp
 * @param {string} phoneNumber - Nomor WhatsApp customer
 * @param {Object} orderData - Data pesanan
 * @returns {Promise<Object>} Response dari Fonnte API
 */
export async function sendOrderNotification(phoneNumber, orderData) {
  try {
    const { orderId, customerName, items, total, status } = orderData;
    
    let itemsList = "";
    items.forEach((item, idx) => {
      itemsList += `${idx + 1}. ${item.name} (${item.qty}x) - Rp ${item.price.toLocaleString("id-ID")}\n`;
    });

    const statusEmoji = status === "PAID" ? "✅" : status === "PENDING" ? "⏳" : "❌";
    
    const message = `${statusEmoji} *PESANAN BARU - Millenium Jaya*\n\n` +
      `📋 Order ID: #${orderId}\n` +
      `👤 Customer: ${customerName}\n` +
      `📱 Phone: ${phoneNumber}\n\n` +
      `🛒 *Detail Pesanan:*\n${itemsList}\n` +
      `💰 *Total Dibayar: Rp ${total.toLocaleString("id-ID")}*\n\n` +
      `⏱️ Status: ${status === "PAID" ? "LUNAS" : "Menunggu Pembayaran"}\n\n` +
      `Terima kasih! 🙏`;

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": FONNTE_TOKEN
      },
      body: JSON.stringify({
        target: phoneNumber,
        message: message,
        countryCode: "62"
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.reason || "Gagal mengirim notifikasi");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending order notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Kirim notifikasi pembayaran berhasil
 * @param {string} phoneNumber - Nomor WhatsApp customer
 * @param {Object} orderData - Data pesanan
 * @returns {Promise<Object>} Response dari Fonnte API
 */
export async function sendPaymentSuccessNotification(phoneNumber, orderData) {
  try {
    const { orderId, customerName, total } = orderData;
    
    const message = `✅ *PEMBAYARAN BERHASIL - Millenium Jaya*\n\n` +
      `Order ID: #${orderId}\n` +
      `Customer: ${customerName}\n` +
      `Phone: ${phoneNumber}\n\n` +
      `💰 *Total Dibayar: Rp ${total.toLocaleString("id-ID")}*\n\n` +
      `✅ *Status: LUNAS*\n\n` +
      `Pesanan Anda sedang diproses. Terima kasih! 🎉`;

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": FONNTE_TOKEN
      },
      body: JSON.stringify({
        target: phoneNumber,
        message: message,
        countryCode: "62"
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.reason || "Gagal mengirim notifikasi");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending payment notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate phone number format (Indonesia)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export function validatePhoneNumber(phone) {
  // Format: 08xxx atau 628xxx atau +628xxx (min 10 digit)
  const phoneRegex = /^(\+62|62|0)8[0-9]{8,11}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number to WhatsApp format (628xxx)
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  phone = phone.replace(/\D/g, '');
  
  // Convert 08xxx to 628xxx
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  
  // Remove leading + if exists
  if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  
  // Ensure it starts with 62
  if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }
  
  return phone;
}