"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
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

    // Load cart from localStorage
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing cart:", e);
        setCart([]);
      }
    }

    // Load user data from localStorage
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const photo = localStorage.getItem("userPhoto");
    const role = localStorage.getItem("userRole");
    
    setUserName(name || "VIGWAGON User");
    setUserEmail(email || "user@mail.com");
    setUserPhoto(photo || "");
    setUserRole(role || "user");
  }, [router]);

  if (!isClient) return null; // Prevent SSR issues

  const formatPrice = (price) => {
    if (typeof window === "undefined") return "Rp 0,00";
    const safePrice = isNaN(price) ? 0 : Number(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(safePrice);
  };

  const total = cart.reduce((sum, c) => sum + (c.price * c.qty), 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.qty, 0);

  const goToPayment = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    router.push("/payment");
  };

  const goBack = () => {
    router.push("/select");
  };

  const getProductImage = (productName) => {
    const imageMap = {
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
    return imageMap[productName] ? `/${imageMap[productName]}` : null;
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
                📦 Checkout
              </h1>
              <p style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "4px 0 0 0"
              }}>
                Review your order before payment
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
              <div style={{ fontSize: "12px", color: "#64748b" }}>{userEmail.toUpperCase()}</div>
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
                      onClick={goBack}
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

            {/* Shipping Info */}
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
                  📍 Shipping Information
                </h3>
                <div style={{
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>{userName}</strong>
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                    {userEmail}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
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
                  💳 Order Summary
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
                    <span style={{ color: "#64748b" }}>Shipping</span>
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
                    style={{
                      width: "100%",
                      backgroundColor: "#f97316",
                      color: "white",
                      fontWeight: "bold",
                      padding: "16px 24px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#ea580c";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#f97316";
                    }}
                  >
                    Continue to Payment →
                  </button>
                )}
                
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
                    🔒 Secure 256-bit SSL encryption
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