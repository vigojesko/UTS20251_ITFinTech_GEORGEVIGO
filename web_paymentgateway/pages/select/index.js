import { useEffect, useState } from "react";

export default function SelectPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  
  // Modal states
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfile, setShowProfile] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  
  // Loading & error states
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ======= LOAD USER DATA =======
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      const photo = localStorage.getItem("userPhoto");
      
      if (token) {
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name || "User");
        setUserEmail(email || "");
        setUserPhoto(photo || "");
      }
    }
  }, []);

  // ======= LOAD PRODUCTS =======
  useEffect(() => {
    const mockProducts = [
      { _id: "1", name: "Teh Botol", price: 5000 },
      { _id: "2", name: "Nasi Goreng", price: 25000 },
      { _id: "3", name: "Keripik", price: 10000 },
      { _id: "4", name: "Bakmie", price: 20000 },
      { _id: "5", name: "Siomay", price: 15000 },
      { _id: "6", name: "Es Kelapa", price: 8000 },
      { _id: "7", name: "Es Jeruk", price: 7000 },
      { _id: "8", name: "Gado-Gado", price: 18000 },
      { _id: "9", name: "Sate Kambing", price: 35000 },
      { _id: "10", name: "Sop Kambing", price: 40000 },
      { _id: "11", name: "Ayam Taliwang", price: 30000 },
      { _id: "12", name: "Teh Tarik", price: 6000 },
    ];
    setTimeout(() => setProducts(mockProducts), 500);
  }, []);

  // ======= CART FUNCTIONS =======
  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(cart.map((c) => (c._id === item._id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find((c) => c._id === itemId);
    if (existing && existing.qty > 1) {
      setCart(cart.map((c) => (c._id === itemId ? { ...c, qty: c.qty - 1 } : c)));
    } else {
      setCart(cart.filter((c) => c._id !== itemId));
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price || 0);

  const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.qty, 0);
  const getTotalItems = () => cart.reduce((t, i) => t + i.qty, 0);


// ======= REGISTER FUNCTION (DIPERBAIKI) =======
const handleRegister = async () => {
  setAuthError("");
  
  if (!fullName || !email || !password || !confirmPassword) {
    setAuthError("Semua field harus diisi!");
    return;
  }
  
  if (password !== confirmPassword) {
    setAuthError("Password tidak cocok!");
    return;
  }
  
  if (password.length < 6) {
    setAuthError("Password minimal 6 karakter!");
    return;
  }

  setAuthLoading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userExists = existingUsers.some(u => u.email === email);
    
    if (userExists) {
      setAuthError("Email sudah terdaftar!");
      setAuthLoading(false);
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password,
      role: selectedRole,
      photo: "", // Simpan sebagai empty string untuk user baru
      createdAt: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

    const token = `token_${newUser.id}_${Date.now()}`;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("userName", fullName);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPhoto", ""); // Set empty string untuk foto
    localStorage.setItem("currentUserId", newUser.id);

    setIsLoggedIn(true);
    setUserRole(selectedRole);
    setUserName(fullName);
    setUserEmail(email);
    setUserPhoto("");
    
    setShowAuth(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    
    alert("🎉 Registrasi berhasil! Selamat datang " + fullName);

    if (selectedRole === "admin") {
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 500);
    }
  } catch (e) {
    setAuthError("Gagal mendaftar. Coba lagi.");
  } finally {
    setAuthLoading(false);
  }
};

// ======= LOGIN FUNCTION (DIPERBAIKI) =======
const handleLogin = async () => {
  setAuthError("");
  setAuthLoading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    
    const demoAccounts = [
      { email: "admin@mail.com", password: "admin123", role: "admin", fullName: "Admin VIGWAGON", photo: "" },
      { email: "user@mail.com", password: "user123", role: "user", fullName: "VIGWAGON User", photo: "" }
    ];

    let foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      foundUser = demoAccounts.find(u => u.email === email && u.password === password);
    }

    if (foundUser) {
      const token = `token_${foundUser.id || 'demo'}_${Date.now()}`;
      
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", foundUser.role);
      localStorage.setItem("userName", foundUser.fullName);
      localStorage.setItem("userEmail", foundUser.email);
      
      // PENTING: Simpan photo dengan benar
      // Jika photo ada dan tidak kosong, gunakan itu. Kalau tidak, gunakan string kosong
      const photoToSave = foundUser.photo && foundUser.photo.trim() !== "" ? foundUser.photo : "";
      localStorage.setItem("userPhoto", photoToSave);
      
      if (foundUser.id) {
        localStorage.setItem("currentUserId", foundUser.id);
      }
      
      setIsLoggedIn(true);
      setUserRole(foundUser.role);
      setUserName(foundUser.fullName);
      setUserEmail(foundUser.email);
      setUserPhoto(photoToSave); // Update state dengan photo yang tersimpan
      setShowAuth(false);
      setEmail("");
      setPassword("");

      if (foundUser.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    } else {
      setAuthError("Email atau password salah!");
    }
  } catch (e) {
    setAuthError("Gagal login. Coba lagi.");
  } finally {
    setAuthLoading(false);
  }
};

// ======= UPDATE PROFILE =======
const handleUpdateProfile = (newName, newEmail, newPhoto) => {
  localStorage.setItem("userName", newName);
  localStorage.setItem("userEmail", newEmail);
  
  // PENTING: Simpan photo dengan benar
  const photoToSave = newPhoto && newPhoto.trim() !== "" ? newPhoto : "";
  localStorage.setItem("userPhoto", photoToSave);
  
  const userId = localStorage.getItem("currentUserId");
  if (userId) {
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, fullName: newName, email: newEmail, photo: photoToSave } : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  }
  
  setUserName(newName);
  setUserEmail(newEmail);
  setUserPhoto(photoToSave);
  alert("✅ Profile berhasil diupdate!");
};

// ======= LOGOUT FUNCTION =======
const handleLogout = () => {
  // Hapus semua data dari localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPhoto");
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("cart");
  
  // Update state
  setIsLoggedIn(false);
  setUserRole(null);
  setUserName("");
  setUserEmail("");
  setUserPhoto("");
  setCart([]);
  
  // Tampilkan alert
  alert("Logout berhasil!");
};

  // ======= CHECKOUT =======
  const goToCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjangmu masih kosong.");
      return;
    }
    
    if (!isLoggedIn) {
      setShowAuth(true);
      setAuthMode("login");
      return;
    }

    if (userRole === "admin") {
      alert("Admin tidak bisa checkout. Silakan login sebagai User.");
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/checkout";
  };

  const goToDashboard = () => {
    window.location.href = "/admin/dashboard";
  };

  const getProductImage = (productName) => {
    const imageMap = {
      "Teh Botol": "tehbotol.png",
      "Nasi Goreng": "nasigoreng.png",
      Keripik: "keripik.png",
      Bakmie: "bakmie.png",
      Siomay: "siomay.png",
      "Es Kelapa": "eskelapa.png",
      "Es Jeruk": "esjeruk.png",
      "Gado-Gado": "gadogado.png",
      "Sate Kambing": "satekambing.png",
      "Sop Kambing": "sopkambing.png",
      "Ayam Taliwang": "ayamtaliwang.png",
      "Teh Tarik": "tehtarik.png",
    };
    const imageName = imageMap[productName];
    return imageName ? `/${imageName}` : null;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "#f97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>🛒</div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>Wagon Kopitiam</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>PT WAGON NUSANTARA GROUP</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isLoggedIn ? (
              <>
                <div 
                  onClick={() => setShowProfile(true)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px", borderRadius: "8px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: userRole === "admin" ? "#ef4444" : "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "16px", border: `2px solid ${userRole === "admin" ? "#dc2626" : "#ea580c"}`, overflow: "hidden" }}>
                    {userPhoto ? (
                      <img src={userPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>{userRole === "admin" ? "👨‍💼" : "👤"}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{userName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{userRole === "admin" ? "Administrator" : "Customer"}</div>
                  </div>
                </div>

                {userRole === "admin" && (
                  <button onClick={goToDashboard} style={{ backgroundColor: "#3b82f6", color: "white", fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "14px" }}>📊 Dashboard</button>
                )}

                <button onClick={handleLogout} style={{ backgroundColor: "#e5e7eb", color: "#111827", fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}>Logout</button>
              </>
            ) : (
              <button onClick={() => { setShowAuth(true); setAuthMode("login"); }} style={{ backgroundColor: "#f97316", color: "white", fontWeight: 600, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>Login / Sign Up</button>
            )}
          </div>
        </div>
      </header>

      

      {/* HERO - DENGAN FOTO RESTORAN */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ 
          borderRadius: "16px", 
          minHeight: "300px", 
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }}>
          {/* Background Image dengan Overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5)"
          }}></div>
          
          {/* Content Overlay */}
          <div style={{ 
            position: "relative", 
            zIndex: 1, 
            padding: "48px",
            color: "white"
          }}>
            <div style={{ fontSize: "14px", opacity: 0.95, marginBottom: "8px", fontWeight: "600" }}>December 12 - 20</div>
            <h1 style={{ fontSize: "42px", fontWeight: "bold", margin: "0 0 16px 0", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
              Nikmati Gratis Ongkir untuk Semua Produk!
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.95, margin: "0 0 24px 0", maxWidth: "600px", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
              Bakmie, Keripik, dan Kopi: Perjalanan rasa Indonesia dalam satu platform
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              style={{ 
                backgroundColor: "#f97316", 
                color: "white", 
                padding: "14px 28px", 
                borderRadius: "10px", 
                fontWeight: "bold", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ea580c";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f97316";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Mulai Belanja
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", margin: "0 0 32px 0" }}>Pilih Produk</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
          {products.map((p) => {
            const imagePath = getProductImage(p.name);
            return (
              <div key={p._id} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <div style={{ height: "200px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {imagePath ? (
                    <img src={imagePath} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : <span style={{ fontSize: "48px" }}>🍽️</span>}
                  <button onClick={() => addToCart(p)} style={{ position: "absolute", top: "12px", right: "12px", width: "36px", height: "36px", backgroundColor: "white", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>🛒</button>
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontWeight: "bold", color: "#1f2937", fontSize: "16px", margin: "0 0 8px 0" }}>{p.name}</h3>
                  <div style={{ color: "#fbbf24", fontSize: "14px", marginBottom: "8px" }}>★★★★☆ <span style={{ fontSize: "12px", color: "#64748b" }}>(4.2)</span></div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#14b8a6", marginBottom: "12px" }}>{formatPrice(p.price)}</div>
                  <button onClick={() => addToCart(p)} style={{ width: "100%", backgroundColor: "#f1f5f9", color: "#475569", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer" }}>🛒 Tambah ke Cart</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CART FLOATING - DIPERBAIKI */}
      {cart.length > 0 && (
        <div style={{ 
          position: "fixed", 
          bottom: "24px", 
          right: "24px", 
          backgroundColor: "white", 
          borderRadius: "16px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)", 
          border: "2px solid #f97316", 
          width: "380px", 
          maxHeight: "520px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{ 
            padding: "18px 20px", 
            borderBottom: "2px solid #fed7aa", 
            fontWeight: "bold", 
            fontSize: "18px", 
            backgroundColor: "#fff7ed",
            borderRadius: "14px 14px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>🛒 Keranjang</span>
            <span style={{ 
              backgroundColor: "#f97316", 
              color: "white", 
              padding: "4px 12px", 
              borderRadius: "20px", 
              fontSize: "14px" 
            }}>
              {getTotalItems()} items
            </span>
          </div>
          
          {/* Cart Items */}
          <div style={{ 
            padding: "16px 20px", 
            maxHeight: "300px", 
            overflowY: "auto",
            flex: 1
          }}>
            {cart.map((c, i) => (
              <div key={i} style={{ 
                display: "flex", 
                alignItems: "center",
                gap: "12px",
                padding: "12px 0", 
                borderBottom: i < cart.length - 1 ? "1px solid #f1f5f9" : "none" 
              }}>
                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: "600", 
                    fontSize: "14px",
                    color: "#1f2937",
                    marginBottom: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {c.name}
                  </div>
                  <div style={{ 
                    fontSize: "13px", 
                    color: "#64748b",
                    fontWeight: "500"
                  }}>
                    {formatPrice(c.price)} × {c.qty}
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "4px"
                }}>
                  <button 
                    onClick={() => removeFromCart(c._id)}
                    style={{ 
                      width: "28px", 
                      height: "28px", 
                      backgroundColor: "#fee2e2", 
                      color: "#dc2626",
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    −
                  </button>
                  <span style={{ 
                    fontWeight: "600", 
                    fontSize: "14px",
                    minWidth: "24px",
                    textAlign: "center"
                  }}>
                    {c.qty}
                  </span>
                  <button 
                    onClick={() => addToCart(c)}
                    style={{ 
                      width: "28px", 
                      height: "28px", 
                      backgroundColor: "#dcfce7", 
                      color: "#16a34a",
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    +
                  </button>
                </div>
                
                {/* Price */}
                <div style={{ 
                  color: "#14b8a6", 
                  fontWeight: "bold",
                  fontSize: "15px",
                  minWidth: "90px",
                  textAlign: "right"
                }}>
                  {formatPrice(c.price * c.qty)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div style={{ 
            padding: "18px 20px", 
            borderTop: "2px solid #fed7aa", 
            backgroundColor: "#fff7ed",
            borderRadius: "0 0 14px 14px"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "14px",
              alignItems: "center"
            }}>
              <span style={{ 
                fontWeight: "bold",
                fontSize: "16px",
                color: "#1f2937"
              }}>
                Total:
              </span>
              <span style={{ 
                fontSize: "24px", 
                fontWeight: "bold", 
                color: "#14b8a6" 
              }}>
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <button 
              onClick={goToCheckout} 
              style={{ 
                width: "100%", 
                backgroundColor: "#f97316", 
                color: "white", 
                fontWeight: "bold", 
                padding: "14px", 
                borderRadius: "10px", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "16px",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(249,115,22,0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ea580c";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f97316";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Lanjut ke Checkout →
            </button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={() => !authLoading && setShowAuth(false)}>
          <div style={{ width: 440, maxWidth: "90vw", backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {authMode === "login" ? "Login ke VIGWAGON" : "Daftar Akun Baru"}
            </h3>
            <p style={{ marginTop: 0, color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              {authMode === "login" ? "Pilih role dan masukkan kredensial" : "Buat akun untuk mulai berbelanja"}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, display: "block" }}>Login sebagai:</label>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setSelectedRole("user")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: selectedRole === "user" ? "2px solid #f97316" : "2px solid #e2e8f0", backgroundColor: selectedRole === "user" ? "#fff7ed" : "white", cursor: "pointer", fontWeight: 600, color: selectedRole === "user" ? "#f97316" : "#64748b" }}>👤 User</button>
                <button onClick={() => setSelectedRole("admin")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: selectedRole === "admin" ? "2px solid #ef4444" : "2px solid #e2e8f0", backgroundColor: selectedRole === "admin" ? "#fef2f2" : "white", cursor: "pointer", fontWeight: 600, color: selectedRole === "admin" ? "#ef4444" : "#64748b" }}>👨‍💼 Admin</button>
              </div>
            </div>

            {authMode === "login" && (
              <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: "#0369a1", marginBottom: 4 }}>🔑 Demo Credentials:</div>
                <div style={{ color: "#075985" }}>
                  <strong>User:</strong> user@mail.com / user123<br />
                  <strong>Admin:</strong> admin@mail.com / admin123
                </div>
              </div>
            )}

            {authMode === "register" && (
              <input type="text" placeholder="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", marginBottom: 12, outline: "none", fontSize: 14, boxSizing: "border-box" }} />
            )}

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", marginBottom: 12, outline: "none", fontSize: 14, boxSizing: "border-box" }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", marginBottom: authMode === "register" ? 12 : 8, outline: "none", fontSize: 14, boxSizing: "border-box" }} />

            {authMode === "register" && (
              <input type="password" placeholder="Konfirmasi Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", marginBottom: 8, outline: "none", fontSize: 14, boxSizing: "border-box" }} />
            )}

            {authError && (
              <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>❌ {authError}</div>
            )}

            <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={authLoading} style={{ width: "100%", padding: "12px", backgroundColor: authLoading ? "#fb923c" : "#f97316", color: "white", border: "none", borderRadius: 10, cursor: authLoading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15 }}>
              {authLoading ? "Memproses..." : (authMode === "login" ? "Login" : "Daftar")}
            </button>

            <button onClick={() => setShowAuth(false)} disabled={authLoading} style={{ width: "100%", padding: "10px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, cursor: authLoading ? "not-allowed" : "pointer", marginTop: 10, fontWeight: 600, fontSize: 14 }}>Batal</button>

            <div style={{ marginTop: 16, fontSize: 13, color: "#64748b", textAlign: "center" }}>
              {authMode === "login" ? (
                <>Belum punya akun? <strong style={{ color: "#f97316", cursor: "pointer" }} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Daftar sekarang</strong></>
              ) : (
                <>Sudah punya akun? <strong style={{ color: "#f97316", cursor: "pointer" }} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Login</strong></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <ProfileModal 
          userName={userName}
          userEmail={userEmail}
          userPhoto={userPhoto}
          userRole={userRole}
          onClose={() => setShowProfile(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}

// ======= PROFILE MODAL COMPONENT =======
function ProfileModal({ userName, userEmail, userPhoto, userRole, onClose, onUpdate }) {
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editPhoto, setEditPhoto] = useState(userPhoto);
  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editName || !editEmail) {
      alert("Nama dan email harus diisi!");
      return;
    }
    onUpdate(editName, editEmail, editPhoto);
    setIsEditing(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
      <div style={{ width: 500, maxWidth: "90vw", backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>👤 Profile Saya</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", backgroundColor: "#f1f5f9", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>

        {/* Profile Photo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: "120px", height: "120px", margin: "0 auto", borderRadius: "50%", backgroundColor: userRole === "admin" ? "#ef4444" : "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "48px", border: "4px solid #e2e8f0", overflow: "hidden" }}>
            {editPhoto ? (
              <img src={editPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span>{userRole === "admin" ? "👨‍💼" : "👤"}</span>
            )}
          </div>
          
          {isEditing && (
            <div style={{ marginTop: 16 }}>
              <label style={{ padding: "8px 16px", backgroundColor: "#f97316", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "inline-block" }}>
                📷 Upload Foto
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, display: "block" }}>Nama Lengkap</label>
          {isEditing ? (
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", outline: "none", fontSize: 14, boxSizing: "border-box" }} 
            />
          ) : (
            <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: 10, fontSize: 14 }}>{userName}</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, display: "block" }}>Email</label>
          {isEditing ? (
            <input 
              type="email" 
              value={editEmail} 
              onChange={(e) => setEditEmail(e.target.value)} 
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", outline: "none", fontSize: 14, boxSizing: "border-box" }} 
            />
          ) : (
            <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: 10, fontSize: 14 }}>{userEmail}</div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, display: "block" }}>Role</label>
          <div style={{ padding: "12px", backgroundColor: userRole === "admin" ? "#fef2f2" : "#fff7ed", borderRadius: 10, fontSize: 14, fontWeight: "600", color: userRole === "admin" ? "#ef4444" : "#f97316" }}>
            {userRole === "admin" ? "👨‍💼 Administrator" : "👤 Customer"}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          {isEditing ? (
            <>
              <button 
                onClick={() => { 
                  setIsEditing(false); 
                  setEditName(userName); 
                  setEditEmail(userEmail); 
                  setEditPhoto(userPhoto); 
                }} 
                style={{ flex: 1, padding: "12px", backgroundColor: "#e5e7eb", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 1, padding: "12px", backgroundColor: "#f97316", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                💾 Simpan
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ width: "100%", padding: "12px", backgroundColor: "#f97316", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}