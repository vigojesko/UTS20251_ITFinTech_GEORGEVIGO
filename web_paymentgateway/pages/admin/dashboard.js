import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [checkouts, setCheckouts] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userName] = useState("Admin");
  const router = useRouter();

  // Modal states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  useEffect(() => {
    // Mock data untuk testing
    const mockCheckouts = [
      {
        _id: "1",
        userEmail: "customer1@mail.com",
        items: [
          { name: "Teh Botol", quantity: 2, price: 5000 },
          { name: "Keripik", quantity: 1, price: 10000 }
        ],
        total: 20000,
        status: "PAID",
        createdAt: new Date().toISOString()
      },
      {
        _id: "2",
        userEmail: "customer2@mail.com",
        items: [{ name: "Nasi Goreng", quantity: 1, price: 25000 }],
        total: 25000,
        status: "PENDING_PAYMENT",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: "3",
        userEmail: "customer3@mail.com",
        items: [
          { name: "Bakmie", quantity: 2, price: 20000 },
          { name: "Es Jeruk", quantity: 2, price: 7000 }
        ],
        total: 54000,
        status: "PAID",
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        _id: "4",
        userEmail: "customer4@mail.com",
        items: [{ name: "Siomay", quantity: 3, price: 15000 }],
        total: 45000,
        status: "PAID",
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        _id: "5",
        userEmail: "customer5@mail.com",
        items: [{ name: "Gado-Gado", quantity: 1, price: 18000 }],
        total: 18000,
        status: "PENDING_PAYMENT",
        createdAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];

    const mockProducts = [
      { _id: "1", name: "Teh Botol", price: 5000, stock: 100 },
      { _id: "2", name: "Nasi Goreng", price: 25000, stock: 50 },
      { _id: "3", name: "Keripik", price: 10000, stock: 75 },
      { _id: "4", name: "Bakmie", price: 20000, stock: 60 },
      { _id: "5", name: "Siomay", price: 15000, stock: 40 },
      { _id: "6", name: "Es Kelapa", price: 8000, stock: 80 },
      { _id: "7", name: "Es Jeruk", price: 7000, stock: 90 },
      { _id: "8", name: "Gado-Gado", price: 18000, stock: 45 }
    ];

    const paidCheckouts = mockCheckouts.filter(c => c.status === "PAID");
    const mockSummary = {
      totalOrders: mockCheckouts.length,
      totalOmzet: paidCheckouts.reduce((sum, c) => sum + c.total, 0),
      totalPending: mockCheckouts.filter(c => c.status === "PENDING_PAYMENT").length,
      totalPaid: paidCheckouts.length
    };

    setTimeout(() => {
      setCheckouts(mockCheckouts);
      setProducts(mockProducts);
      setSummary(mockSummary);
      setLoading(false);
    }, 800);
  }, []);

  const handleLogout = () => {
    alert("Logout berhasil!");
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Nama dan harga produk harus diisi!");
      return;
    }
    
    const product = {
      _id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 0
    };
    
    setProducts([...products, product]);
    setNewProduct({ name: "", price: "", stock: "" });
    setShowAddProduct(false);
    alert("Produk berhasil ditambahkan!");
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      setProducts(products.filter(p => p._id !== id));
      alert("Produk berhasil dihapus!");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price || 0);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            fontSize: "48px", 
            marginBottom: "16px"
          }}>⚙️</div>
          <p style={{ fontSize: "18px", color: "#64748b" }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "500px",
            width: "90%"
          }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "700" }}>
              ➕ Tambah Produk Baru
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
                Nama Produk
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Contoh: Nasi Goreng"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
                Harga (Rp)
              </label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="25000"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
                Stock
              </label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                placeholder="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowAddProduct(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Batal
              </button>
              <button
                onClick={handleAddProduct}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#ef4444",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              📊
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: "24px", 
                fontWeight: "700",
                color: "#1f2937"
              }}>
                Admin Dashboard
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: "13px", 
                color: "#64748b" 
              }}>
                VIGWAGON E-commerce Management
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              padding: "8px 16px",
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <div style={{ fontSize: "12px", color: "#b91c1c", fontWeight: "600" }}>
                👤 {userName}
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "10px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              🏠 Kembali ke Shop
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 16px",
                backgroundColor: "#e5e7eb",
                color: "#1f2937",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: "81px",
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          gap: "8px"
        }}>
          {[
            { id: "overview", label: "📈 Overview" },
            { id: "orders", label: "🛒 Transaksi" },
            { id: "products", label: "📦 Produk" },
            { id: "analytics", label: "📊 Analytics" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #f97316" : "3px solid transparent",
                color: activeTab === tab.id ? "#f97316" : "#64748b",
                fontWeight: activeTab === tab.id ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px"
      }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
              gap: "20px", 
              marginBottom: "24px" 
            }}>
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                color: "white"
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Produk</div>
                <div style={{ fontSize: "36px", fontWeight: "700", marginBottom: "4px" }}>
                  {products.length}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>📦 Item terdaftar</div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)",
                color: "white"
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Order</div>
                <div style={{ fontSize: "36px", fontWeight: "700", marginBottom: "4px" }}>
                  {summary?.totalOrders ?? 0}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  🟢 {summary?.totalPaid ?? 0} Paid | 🟡 {summary?.totalPending ?? 0} Pending
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(79, 172, 254, 0.4)",
                color: "white"
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Omzet</div>
                <div style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>
                  {formatPrice(summary?.totalOmzet ?? 0)}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>💰 Revenue keseluruhan</div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(250, 112, 154, 0.4)",
                color: "white"
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Avg Order Value</div>
                <div style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>
                  {formatPrice(summary?.totalPaid > 0 ? (summary?.totalOmzet / summary?.totalPaid) : 0)}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>📈 Per transaksi</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px"
            }}>
              {/* Recent Orders */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ 
                  margin: "0 0 20px 0", 
                  fontSize: "18px", 
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  🛒 Transaksi Terbaru
                </h2>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {checkouts.slice(0, 5).map((c) => (
                    <div key={c._id} style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>
                          {c.userEmail}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {new Date(c.createdAt).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", color: "#14b8a6", fontSize: "14px" }}>
                          {formatPrice(c.total)}
                        </div>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor: c.status === "PAID" ? "#dcfce7" : "#fef3c7",
                          color: c.status === "PAID" ? "#15803d" : "#b45309"
                        }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ 
                  margin: "0 0 20px 0", 
                  fontSize: "18px", 
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  🏆 Top Produk
                </h2>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {products.slice(0, 5).map((p, idx) => (
                    <div key={p._id} style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          color: "#64748b"
                        }}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Stock: {p.stock}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: "700", color: "#14b8a6", fontSize: "14px" }}>
                        {formatPrice(p.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                🛒 Semua Transaksi
              </h2>
              <div style={{
                padding: "8px 16px",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569"
              }}>
                Total: {checkouts.length} transaksi
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: "#f8fafc", 
                    borderBottom: "2px solid #e2e8f0" 
                  }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      ID
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      Tanggal
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      Customer
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      Items
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", fontSize: "13px", color: "#64748b" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.map((c) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                        #{c._id.slice(-6)}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px" }}>
                        {new Date(c.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>
                        {c.userEmail || "-"}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#64748b" }}>
                        {c.items?.map(i => `${i.name} ×${i.quantity}`).join(", ")}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: c.status === "PAID" ? "#dcfce7" : c.status === "PENDING_PAYMENT" ? "#fef3c7" : "#f3f4f6",
                          color: c.status === "PAID" ? "#15803d" : c.status === "PENDING_PAYMENT" ? "#b45309" : "#6b7280"
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontSize: "15px", fontWeight: "700", color: "#14b8a6" }}>
                        {formatPrice(c.total)}
                      </td>
                    </tr>
                  ))}
                  {checkouts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                        <div style={{ fontSize: "16px", fontWeight: "600" }}>Belum ada transaksi</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                📦 Manajemen Produk
              </h2>
              <button
                onClick={() => setShowAddProduct(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                ➕ Tambah Produk
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px"
            }}>
              {products.map((p) => (
                <div
                  key={p._id}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    position: "relative"
                  }}
                >
                  <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>
                    {p.name}
                  </h3>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "700", 
                    color: "#14b8a6",
                    marginBottom: "12px"
                  }}>
                    {formatPrice(p.price)}
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    backgroundColor: p.stock > 20 ? "#dcfce7" : "#fef3c7",
                    color: p.stock > 20 ? "#15803d" : "#b45309",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    display: "inline-block"
                  }}>
                    📦 Stock: {p.stock}
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p._id)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    🗑️ Hapus Produk
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Revenue Chart - 7 Hari */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1f2937"
              }}>
                📈 Omzet Per Hari (7 Hari)
              </h3>
              
              <div style={{ height: "300px", display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
                {[
                  { hari: "Sen", nilai: 150000 },
                  { hari: "Sel", nilai: 220000 },
                  { hari: "Rab", nilai: 185000 },
                  { hari: "Kam", nilai: 280000 },
                  { hari: "Jum", nilai: 340000 },
                  { hari: "Sab", nilai: 425000 },
                  { hari: "Min", nilai: 380000 }
                ].map((item, idx) => {
                  const maxVal = 425000;
                  const height = (item.nilai / maxVal) * 250;
                  return (
                    <div key={idx} style={{ flex: 1 }}>
                      <div 
                        style={{
                          height: `${height}px`,
                          backgroundColor: "#14b8a6",
                          borderRadius: "8px 8px 0 0",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0d9488"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#14b8a6"}
                        title={`${item.hari}: ${formatPrice(item.nilai)}`}
                      />
                      <div style={{ 
                        textAlign: "center", 
                        marginTop: "8px", 
                        fontSize: "12px", 
                        fontWeight: "600",
                        color: "#64748b"
                      }}>
                        {item.hari}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{
                padding: "12px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #dcfce7",
                fontSize: "13px",
                color: "#15803d"
              }}>
                💰 Total Minggu: {formatPrice(1980000)}
              </div>
            </div>

            {/* Status Distribution */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1f2937"
              }}>
                📊 Status Transaksi
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "✅ PAID", value: summary?.totalPaid || 0, total: summary?.totalOrders || 5, color: "#10b981" },
                  { label: "⏳ PENDING", value: summary?.totalPending || 0, total: summary?.totalOrders || 5, color: "#f59e0b" },
                  { label: "❌ CANCELLED", value: 0, total: summary?.totalOrders || 5, color: "#ef4444" }
                ].map((item, idx) => {
                  const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        fontSize: "14px"
                      }}>
                        <span style={{ fontWeight: "600", color: "#1f2937" }}>
                          {item.label}
                        </span>
                        <span style={{ color: "#64748b" }}>
                          {item.value} / {item.total}
                        </span>
                      </div>
                      <div style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "4px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor: item.color,
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Sales */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1f2937"
              }}>
                💳 Penjualan Per Bulan
              </h3>
              
              <div style={{ height: "250px", display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
                {[
                  { bulan: "Jan", nilai: 500000 },
                  { bulan: "Feb", nilai: 650000 },
                  { bulan: "Mar", nilai: 720000 },
                  { bulan: "Apr", nilai: 580000 },
                  { bulan: "May", nilai: 890000 },
                  { bulan: "Jun", nilai: 1200000 },
                  { bulan: "Jul", nilai: 950000 },
                  { bulan: "Aug", nilai: 1100000 },
                  { bulan: "Sep", nilai: 1320000 },
                  { bulan: "Oct", nilai: 1980000 }
                ].map((item, idx) => {
                  const maxVal = 1980000;
                  const height = (item.nilai / maxVal) * 200;
                  return (
                    <div key={idx} style={{ flex: 1 }}>
                      <div 
                        style={{
                          height: `${height}px`,
                          backgroundColor: "#3b82f6",
                          borderRadius: "6px 6px 0 0",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                        title={`${item.bulan}: ${formatPrice(item.nilai)}`}
                      />
                      <div style={{ 
                        textAlign: "center", 
                        marginTop: "6px", 
                        fontSize: "11px", 
                        fontWeight: "600",
                        color: "#64748b"
                      }}>
                        {item.bulan}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{
                padding: "12px",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                border: "1px solid #bae6fd",
                fontSize: "13px",
                color: "#0369a1"
              }}>
                📊 Total YTD: {formatPrice(9900000)}
              </div>
            </div>

            {/* Top Products */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1f2937"
              }}>
                🏆 Produk Terpopuler
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { nama: "Sate Kambing", terjual: 45, revenue: 1575000 },
                  { nama: "Bakmie", terjual: 38, revenue: 760000 },
                  { nama: "Nasi Goreng", terjual: 32, revenue: 800000 },
                  { nama: "Sop Kambing", terjual: 28, revenue: 1120000 },
                  { nama: "Gado-Gado", terjual: 24, revenue: 432000 }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6"][idx]}`
                  }}>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>
                        #{idx + 1} {item.nama}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Terjual: {item.terjual} unit
                      </div>
                    </div>
                    <div style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#14b8a6",
                      textAlign: "right"
                    }}>
                      {formatPrice(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              {[
                { label: "Avg Order Value", value: formatPrice(summary?.totalPaid > 0 ? (summary?.totalOmzet / summary?.totalPaid) : 0), trend: "+12%", positive: true },
                { label: "Conversion Rate", value: "68%", trend: "+5%", positive: true },
                { label: "Customer Baru", value: "23", trend: "+8%", positive: true },
                { label: "Return Rate", value: "2%", trend: "-1%", positive: true }
              ].map((metric, idx) => (
                <div key={idx} style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  borderTop: `3px solid ${metric.positive ? "#10b981" : "#ef4444"}`
                }}>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
                    {metric.value}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: metric.positive ? "#10b981" : "#ef4444",
                    fontWeight: "600"
                  }}>
                    {metric.positive ? "📈" : "📉"} {metric.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}