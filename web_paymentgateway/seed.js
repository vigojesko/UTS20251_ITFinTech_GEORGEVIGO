// Load environment variables dari .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "./Lib/mongodb.js";
import Product from "./models/Product.js";

const seed = async () => {
  try {
    // Koneksi ke database
    await dbConnect();

    // Data produk
    const products = [
      {
        name: "Teh Botol",
        category: "Drinks",
        price: 5000,
        image: "/tehbotol.png",
        description: "Teh botol segar dingin",
      },
      {
        name: "Nasi Goreng",
        category: "Foods",
        price: 20000,
        image: "/nasigoreng.png",
        description: "Nasi goreng spesial dengan telur & ayam",
      },
      {
        name: "Keripik",
        category: "Snacks",
        price: 10000,
        image: "/keripik.png",
        description: "Keripik renyah gurih",
      },
      {
        name: "Bakmie",
        category: "Foods",
        price: 18000,
        image: "/bakmie.png",
        description: "Bakmie lezat dengan topping ayam",
      },
      {
        name: "Siomay",
        category: "Foods",
        price: 15000,
        image: "/siomay.png",
        description: "Siomay lengkap dengan saus kacang",
      },
      {
        name: "Es Kelapa",
        category: "Drinks",
        price: 12000,
        image: "/eskelapa.png",
        description: "Es kelapa muda segar",
      },
      {
        name: "Es Jeruk",
        category: "Drinks",
        price: 10000,
        image: "/esjeruk.png",
        description: "Es jeruk segar dingin",
      },
      {
        name: "Gado-Gado",
        category: "Snacks",
        price: 20000,
        image: "/gadogado.png",
        description: "Gado-gado sayur dengan bumbu kacang",
      },
    ];

    // Kosongin collection lalu isi ulang
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);

    console.log(`✅ ${inserted.length} produk berhasil ditambahkan!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    process.exit(1);
  }
};

seed();