// Load environment variables dari .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "./Lib/mongodb.js";
import Product from "./models/Product.js";
import User from "./models/user.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    // Koneksi ke database
    console.log("🔍 MONGODB_URL dari env:", process.env.MONGODB_URL);
    await dbConnect();

    // === 1️⃣ SEED PRODUK ===
    const products = [
      { name: "Teh Botol", category: "Drinks", price: 5000, image: "/tehbotol.png", description: "Teh botol segar dingin" },
      { name: "Nasi Goreng", category: "Foods", price: 20000, image: "/nasigoreng.png", description: "Nasi goreng spesial dengan telur & ayam" },
      { name: "Keripik", category: "Snacks", price: 10000, image: "/keripik.png", description: "Keripik renyah gurih" },
      { name: "Bakmie", category: "Foods", price: 18000, image: "/bakmie.png", description: "Bakmie lezat dengan topping ayam" },
      { name: "Siomay", category: "Foods", price: 15000, image: "/siomay.png", description: "Siomay lengkap dengan saus kacang" },
      { name: "Es Kelapa", category: "Drinks", price: 12000, image: "/eskelapa.png", description: "Es kelapa muda segar" },
      { name: "Es Jeruk", category: "Drinks", price: 10000, image: "/esjeruk.png", description: "Es jeruk segar dingin" },
      { name: "Gado-Gado", category: "Snacks", price: 20000, image: "/gadogado.png", description: "Gado-gado sayur dengan bumbu kacang" },
      { name: "Sate Kambing", category: "Foods", price: 25000, image: "/satekambing.png", description: "Sate kambing bakar dengan bumbu kacang" },
      { name: "Sop Kambing", category: "Foods", price: 30000, image: "/sopkambing.png", description: "Sop kambing hangat dengan kuah bening" },
      { name: "Ayam Taliwang", category: "Foods", price: 35000, image: "/ayamtaliwang.png", description: "Ayam taliwang pedas khas Lombok" },
      { name: "Teh Tarik", category: "Drinks", price: 8000, image: "/tehtarik.png", description: "Teh tarik manis hangat" },
      { name: "Nasi Bebek Kecombrang", category: "Foods", price: 28000, image: "/nasibebekkecombrang.png", description: "Nasi bebek dengan sambal kecombrang" },
      { name: "Susu Kacang", category: "Drinks", price: 7000, image: "/susukacang.png", description: "Susu kacang tanah hangat manis" },
      { name: "Patin Bakar", category: "Foods", price: 32000, image: "/patinbakar.png", description: "Ikan patin bakar dengan sambal dabu-dabu" },
    ];

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`✅ ${inserted.length} produk berhasil ditambahkan!`);

    // === 2️⃣ SEED USER ADMIN ===
    await User.deleteMany({}); // kosongkan user collection biar bersih
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user berhasil dibuat:
📧 Email: ${admin.email}
🔑 Password: admin123`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    process.exit(1);
  }
};

seed();