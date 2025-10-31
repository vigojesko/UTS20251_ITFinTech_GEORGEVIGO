"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { sendPaymentSuccessNotification } from "../../lib/fonnte";

export default function PaymentPage() {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // User data from localStorage
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setIsClient(true);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Anda harus login terlebih dahulu!");
      router.push("/select");
      return;
    }

    // Load cart
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsedCart = JSON.parse(saved);
        setCart(parsedCart);
        if (!parsedCart || parsedCart.length === 0) {
          alert("🛒 Keranjang Anda kosong!");
          router.push("/select");
        }
      } catch {
        alert("🛒 Keranjang Anda kosong!");
        router.push("/select");
      }
    } else {
      alert("🛒 Keranjang Anda kosong!");
      router.push("/select");
    }

    // Load user info
    setUserName(localStorage.getItem("userName") || "VIGWAGON User");
    setUserEmail(localStorage.getItem("userEmail") || "user@mail.com");
    setUserPhoto(localStorage.getItem("userPhoto") || "");
    setUserRole(localStorage.getItem("userRole") || "user");
  }, [router]);

  if (!isClient) return null;

  const formatPrice = (price) => {
    const safePrice = isNaN(price) ? 0 : Number(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(safePrice);
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const getTotalItems = () => cart.reduce((t, i) => t + i.qty, 0);

  const handlePaymentSuccess = async (invoiceData) => {
    try {
      const userPhone = "6285856679776"; // bisa diganti dinamis kalau sudah disimpan user
      await sendPaymentSuccessNotification(userPhone, {
        orderId: invoiceData?.id || "Unknown",
        customerName: userName,
        total: total,
      });
      console.log("✅ Notifikasi pembayaran berhasil dikirim ke Fonnte");
    } catch (error) {
      console.error("❌ Gagal kirim notifikasi Fonnte:", error);
    }
  };

  const goToPayment = async () => {
    if (!cart || cart.length === 0) {
      alert("Keranjang masih kosong!");
      router.push("/select");
      return;
    }

    setLoading(true);

    try {
      // Pastikan email valid (bukan nomor)
      const safeEmail = userEmail.includes("@")
        ? userEmail
        : `${userEmail}@example.com`;

      const response = await fetch("/api/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          total,
          userEmail: safeEmail,
          userName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("cart");

        // Kirim notifikasi WhatsApp ke Fonnte
        await handlePaymentSuccess(data.invoice);

        // Redirect ke halaman Xendit
        window.location.href = data.invoice.invoice_url;
      } else {
        alert("❌ Gagal membuat invoice: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Terjadi kesalahan saat memproses pembayaran!");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => router.push("/checkout");

  const getProductImage = (name) => {
    const map = {
      "Teh Botol": "tehbotol.png",
      "Nasi Goreng": "nasigoreng.png",
      "Keripik": "keripik.png",
      "Bakmie": "bakmie.png",
      "Siomay": "siomay.png",
      "Es Kelapa": "eskelapa.png",
      "Es Jeruk": "esjeruk.png",
      "Gado-Gado": "gadogado.png",
      "Sate Kambing": "satekambing.png",
      "Sop Kambing": "sopkambing.png",
      "Ayam Taliwang": "ayamtaliwang.png",
      "Teh Tarik": "tehtarik.png",
    };
    return map[name] ? `/${map[name]}` : null;
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button 
              onClick={goBack}
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#f1f5f9",
                borderRadius: "50%",
                marginRight: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >←</button>
            <div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0"
              }}>
                💳 Payment
              </h1>
              <p style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "4px 0 0 0"
              }}>
                Complete your payment
              </p>
            </div>
          </div>
          
          {/* User Profile Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${userRole === "admin" ? "#ef4444" : "#f97316"}`,
              backgroundColor: userRole === "admin" ? "#ef4444" : "#f97316"
            }}>
              {userPhoto ? (
                <img 
                  src={userPhoto}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <span style={{ color: "white", fontSize: "20px" }}>
                  {userRole === "admin" ? "👨‍💼" : "👤"}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{userEmail}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
          
          {/* Order Items */}
          <div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "24px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  🛒 Order Items ({getTotalItems()} items)
                </h2>
              </div>
              
              <div style={{ padding: "24px" }}>
                {cart.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "#64748b"
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
                    <p style={{ fontSize: "18px", margin: "0 0 8px 0" }}>Your cart is empty</p>
                    <p style={{ fontSize: "14px", margin: "0" }}>Add some items to get started</p>
                    <button
                      onClick={() => router.push("/select")}
                      style={{
                        marginTop: "16px",
                        padding: "10px 20px",
                        backgroundColor: "#f97316",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Kembali Belanja
                    </button>
                  </div>
                ) : (
                  cart.map((c, i) => {
                    const imagePath = getProductImage(c.name);
                    return (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom: i < cart.length - 1 ? "1px solid #f1f5f9" : "none"
                      }}>
                        {/* Product Image */}
                        <div style={{
                          width: "64px",
                          height: "64px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "16px",
                          overflow: "hidden",
                          fontSize: "24px"
                        }}>
                          {imagePath ? (
                            <img 
                              src={imagePath}
                              alt={c.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : "📦"}
                        </div>
                        
                        {/* Product Info */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontWeight: "600",
                            fontSize: "16px",
                            color: "#1f2937",
                            margin: "0 0 4px 0"
                          }}>
                            {c.name}
                          </h3>
                          <div style={{
                            fontSize: "14px",
                            color: "#64748b",
                            marginBottom: "8px"
                          }}>
                            {formatPrice(c.price)} each
                          </div>
                          <span style={{
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}>
                            Qty: {c.qty}
                          </span>
                        </div>
                        
                        {/* Price */}
                        <div style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#14b8a6"
                        }}>
                          {formatPrice(c.price * c.qty)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Customer Info */}
            {cart.length > 0 && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0",
                marginTop: "24px",
                padding: "24px"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 16px 0"
                }}>
                  👤 Customer Information
                </h3>
                <div style={{
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Name:</strong> {userName}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                    <strong>Email:</strong> {userEmail}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              position: "sticky",
              top: "24px"
            }}>
              <div style={{
                padding: "24px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0"
                }}>
                  💰 Payment Summary
                </h2>
              </div>
              
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "24px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px"
                  }}>
                    <span style={{ color: "#64748b" }}>Subtotal ({getTotalItems()} items)</span>
                    <span style={{ fontWeight: "500" }}>{formatPrice(total)}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px"
                  }}>
                    <span style={{ color: "#64748b" }}>Payment Fee</span>
                    <span style={{ fontWeight: "500", color: "#14b8a6" }}>FREE</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px"
                  }}>
                    <span style={{ color: "#64748b" }}>Tax</span>
                    <span style={{ fontWeight: "500" }}>{formatPrice(0)}</span>
                  </div>
                </div>
                
                <div style={{
                  padding: "16px 0",
                  borderTop: "2px solid #e2e8f0",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>Total</span>
                    <span style={{ fontSize: "24px", fontWeight: "bold", color: "#14b8a6" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                
                {cart.length > 0 && (
                  <button
                    onClick={goToPayment}
                    disabled={loading}
                    style={{
                      width: "100%",
                      backgroundColor: loading ? "#94a3b8" : "#f97316",
                      color: "white",
                      fontWeight: "bold",
                      padding: "16px 24px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.backgroundColor = "#ea580c";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = "#f97316";
                    }}
                  >
                    {loading ? "Processing..." : "Bayar Sekarang →"}
                  </button>
                )}
                
                <button
                  onClick={goBack}
                  disabled={loading}
                  style={{
                    width: "100%",
                    backgroundColor: "#e5e7eb",
                    color: "#1f2937",
                    fontWeight: "600",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    marginTop: "12px"
                  }}
                >
                  ← Kembali ke Checkout
                </button>
                
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #e0f2fe"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#0369a1"
                  }}>
                    🔒 Secure payment powered by Xendit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

