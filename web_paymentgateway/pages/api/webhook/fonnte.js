// pages/api/webhook/fonnte.js
// Webhook untuk menerima callback dari Fonnte
// Set URL ini di dashboard Fonnte: https://yourdomain.com/api/webhook/fonnte

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      // Fonnte akan mengirim data seperti ini:
      const {
        device,        // Device ID
        sender,        // Nomor pengirim
        message,       // Pesan dari customer
        member_name,   // Nama contact (jika ada)
        location,      // Lokasi (jika ada)
        media_type,    // Tipe media (image, video, etc)
        url,           // URL media (jika ada)
        timestamp      // Timestamp
      } = req.body;
  
      console.log("📱 Incoming webhook from Fonnte:", {
        from: sender,
        message: message,
        timestamp: timestamp
      });
  
      // Handle incoming messages
      // Contoh: Customer balas dengan "STATUS ORDER"
      if (message && message.toLowerCase().includes("status")) {
        // Bisa reply otomatis atau simpan ke database
        console.log("🔔 Customer menanyakan status:", sender);
        
        // TODO: Implement auto-reply atau notifikasi ke admin
      }
  
      // Handle image/media
      if (media_type && url) {
        console.log(`📷 Media received: ${media_type} - ${url}`);
        // TODO: Save media to storage
      }
  
      // Simpan ke database untuk history chat
      // TODO: Implement database save
  
      return res.status(200).json({ 
        success: true, 
        message: "Webhook received" 
      });
  
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  }