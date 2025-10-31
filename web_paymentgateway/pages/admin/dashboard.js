import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  // State Management
  const [checkouts, setCheckouts] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userName] = useState("Admin");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Product Management States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" });
  const [searchProduct, setSearchProduct] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Date Range States
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Comparison Data
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [comparison, setComparison] = useState(null);

  // Notification State
  const [notification, setNotification] = useState(null);

  // Chart Hover State
  const [hoveredChart, setHoveredChart] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch main data
        const [checkoutRes, productRes, analyticsRes] = await Promise.all([
          fetch(`/api/checkout?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
          fetch("/api/products"),
          fetch(`/api/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        ]);

        const [checkoutData, productData, analyticsData] = await Promise.all([
          checkoutRes.json(),
          productRes.json(),
          analyticsRes.json()
        ]);

        // Process checkout data
        if (checkoutData.success && checkoutData.data) {
          setCheckouts(checkoutData.data);
          
          const paidCheckouts = checkoutData.data.filter(c => c.status === "PAID");
          const totalOmzet = paidCheckouts.reduce((sum, c) => sum + (c.amount || 0), 0);
          const cancelledCheckouts = checkoutData.data.filter(c => c.status === "CANCELLED");
          
          setSummary({
            totalOrders: checkoutData.data.length,
            totalOmzet: totalOmzet,
            totalPending: checkoutData.data.filter(c => c.status === "PENDING_PAYMENT" || c.status === "PENDING").length,
            totalPaid: paidCheckouts.length,
            totalCancelled: cancelledCheckouts.length,
            avgOrderValue: paidCheckouts.length > 0 ? totalOmzet / paidCheckouts.length : 0
          });
        } else {
          setCheckouts([]);
          setSummary({ totalOrders: 0, totalOmzet: 0, totalPending: 0, totalPaid: 0, totalCancelled: 0, avgOrderValue: 0 });
        }

        // Process product data
        if (productData.success && productData.data) {
          setProducts(productData.data);
        } else {
          setProducts([]);
        }

        // Process analytics data
        if (analyticsData.success) {
          setAnalytics(analyticsData.data);
        }

        // Fetch previous period for comparison
        const daysDiff = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
        const prevStartDate = new Date(new Date(dateRange.startDate) - daysDiff * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const prevEndDate = new Date(new Date(dateRange.startDate) - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const prevCheckoutRes = await fetch(`/api/checkout?startDate=${prevStartDate}&endDate=${prevEndDate}`);
        const prevCheckoutData = await prevCheckoutRes.json();

        if (prevCheckoutData.success && prevCheckoutData.data) {
          const prevPaidCheckouts = prevCheckoutData.data.filter(c => c.status === "PAID");
          const prevTotalOmzet = prevPaidCheckouts.reduce((sum, c) => sum + (c.amount || 0), 0);
          
          setPreviousPeriodData({
            totalOrders: prevCheckoutData.data.length,
            totalOmzet: prevTotalOmzet,
            totalPaid: prevPaidCheckouts.length
          });

          // Calculate comparison
          const paidCheckouts = checkoutData.data.filter(c => c.status === "PAID");
          const currentOmzet = paidCheckouts.reduce((sum, c) => sum + (c.amount || 0), 0);
          const omzetChange = prevTotalOmzet > 0 ? ((currentOmzet - prevTotalOmzet) / prevTotalOmzet) * 100 : 0;
          const ordersChange = prevCheckoutData.data.length > 0 ? ((checkoutData.data.length - prevCheckoutData.data.length) / prevCheckoutData.data.length) * 100 : 0;

          setComparison({
            omzetChange: omzetChange.toFixed(1),
            ordersChange: ordersChange.toFixed(1)
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setCheckouts([]);
        setProducts([]);
        setSummary({ totalOrders: 0, totalOmzet: 0, totalPending: 0, totalPaid: 0, totalCancelled: 0, avgOrderValue: 0 });
        setLoading(false);
        showNotification("Gagal memuat data", "error");
      }
    };

    fetchData();
  }, [dateRange]);

  const handleLogout = () => {
    showNotification("Logout berhasil!", "success");
    setTimeout(() => router.push("/login"), 1500);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      showNotification("Nama dan harga produk harus diisi!", "error");
      return;
    }
    
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock) || 0,
          category: newProduct.category || "Other"
        })
      });

      const data = await response.json();

      if (data.success) {
        setProducts([...products, data.data]);
        setNewProduct({ name: "", price: "", stock: "", category: "" });
        setShowAddProduct(false);
        showNotification("Produk berhasil ditambahkan!", "success");
      } else {
        showNotification("Gagal menambahkan produk: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showNotification("Terjadi kesalahan saat menambah produk!", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE"
        });

        const data = await response.json();

        if (data.success) {
          setProducts(products.filter(p => p._id !== id));
          showNotification("Produk berhasil dihapus!", "success");
        } else {
          showNotification("Gagal menghapus produk: " + data.error, "error");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showNotification("Terjadi kesalahan saat menghapus produk!", "error");
      }
    }
  };

  const handleExportPDF = async () => {
    showNotification("Mengekspor data ke PDF...", "info");
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate,
          data: { checkouts, products, summary, analytics }
        })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${dateRange.startDate}-${dateRange.endDate}.pdf`;
      a.click();
      showNotification("PDF berhasil diunduh!", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showNotification("Gagal mengekspor PDF", "error");
    }
  };

  const handleExportExcel = async () => {
    showNotification("Mengekspor data ke Excel...", "info");
    try {
      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate,
          data: { checkouts, products, summary, analytics }
        })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${dateRange.startDate}-${dateRange.endDate}.xlsx`;
      a.click();
      showNotification("Excel berhasil diunduh!", "success");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      showNotification("Gagal mengekspor Excel", "error");
    }
  };

  const getOrderTotal = (checkout) => {
    if (checkout.amount && checkout.amount > 0) return checkout.amount;
    if (checkout.total && checkout.total > 0) return checkout.total;
    if (checkout.items && checkout.items.length > 0) {
      return checkout.items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.qty || item.quantity || 0));
      }, 0);
    }
    return 0;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "PAID": case "SUCCESS": return { bg: "#dcfce7", color: "#15803d" };
      case "PENDING": case "PENDING_PAYMENT": return { bg: "#fef3c7", color: "#b45309" };
      case "CANCELLED": case "FAILED": return { bg: "#fee2e2", color: "#b91c1c" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(products.map(p => p.category))];

  // Theme colors
  const theme = {
    bg: darkMode ? "#0f172a" : "#f8fafc",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#1f2937",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e2e8f0",
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444"
  };

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: theme.bg,
        gap: "20px"
      }}>
        <div style={{ 
          width: "60px", 
          height: "60px", 
          border: "4px solid " + theme.border, 
          borderTop: "4px solid " + theme.primary, 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} />
        <div style={{ fontSize: "18px", fontWeight: "600", color: theme.text }}>Memuat Dashboard...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", transition: "all 0.3s ease" }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: notification.type === "success" ? theme.success : notification.type === "error" ? theme.danger : theme.primary,
          color: "white",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          animation: "slideIn 0.3s ease",
          maxWidth: "400px"
        }}>
          <span style={{ fontSize: "20px" }}>
            {notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span style={{ fontWeight: "600", fontSize: "15px" }}>{notification.message}</span>
          <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: darkMode ? "#1e293b" : "white", borderBottom: `1px solid ${theme.border}`, padding: "16px 40px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", backgroundColor: "#3b82f6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📊</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: theme.text }}>Admin Dashboard</h1>
              <p style={{ margin: 0, fontSize: "14px", color: theme.textSecondary }}>VIGWAGON E-commerce Management</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{ 
                padding: "10px 16px", 
                backgroundColor: theme.cardBg, 
                border: `1px solid ${theme.border}`, 
                borderRadius: "10px", 
                cursor: "pointer", 
                fontSize: "20px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {darkMode ? "🌞" : "🌙"}
            </button>

            {/* Date Range Picker */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: theme.cardBg, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: "10px", 
                  cursor: "pointer", 
                  fontWeight: "600",
                  color: theme.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px"
                }}
              >
                📅 {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </button>
              {showDatePicker && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  minWidth: "300px"
                }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: theme.text }}>Dari Tanggal</label>
                    <input 
                      type="date" 
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      style={{ 
                        width: "100%", 
                        padding: "10px", 
                        border: `1px solid ${theme.border}`, 
                        borderRadius: "8px",
                        backgroundColor: theme.bg,
                        color: theme.text,
                        fontSize: "14px"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: theme.text }}>Sampai Tanggal</label>
                    <input 
                      type="date" 
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      style={{ 
                        width: "100%", 
                        padding: "10px", 
                        border: `1px solid ${theme.border}`, 
                        borderRadius: "8px",
                        backgroundColor: theme.bg,
                        color: theme.text,
                        fontSize: "14px"
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    style={{ 
                      width: "100%", 
                      padding: "10px", 
                      backgroundColor: theme.primary, 
                      color: "white", 
                      border: "none", 
                      borderRadius: "8px", 
                      cursor: "pointer", 
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Terapkan Filter
                  </button>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <button 
              onClick={handleExportPDF}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#ef4444", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                cursor: "pointer", 
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📄 PDF
            </button>
            <button 
              onClick={handleExportExcel}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#10b981", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                cursor: "pointer", 
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📊 Excel
            </button>

            <div style={{ padding: "10px 20px", backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>👤</span>
              <span style={{ fontWeight: "600", color: theme.text }}>{userName}</span>
            </div>
            <button onClick={handleLogout} style={{ padding: "10px 20px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ backgroundColor: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: "0 40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "4px" }}>
          {[
            { id: "overview", label: "📊 Overview", icon: "📊" },
            { id: "transactions", label: "💳 Transaksi", icon: "💳" },
            { id: "products", label: "📦 Produk", icon: "📦" },
            { id: "analytics", label: "📈 Analytics", icon: "📈" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "16px 24px",
                backgroundColor: activeTab === tab.id ? theme.primary : "transparent",
                color: activeTab === tab.id ? "white" : theme.text,
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid " + theme.primary : "3px solid transparent",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                transition: "all 0.2s",
                borderRadius: "8px 8px 0 0"
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = darkMode ? "#334155" : "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 40px" }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Summary Cards with Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              {[
                { 
                  label: "Total Omzet", 
                  value: formatPrice(summary?.totalOmzet || 0), 
                  icon: "💰", 
                  color: "#10b981",
                  change: comparison?.omzetChange,
                  description: "Total pendapatan periode ini"
                },
                { 
                  label: "Total Pesanan", 
                  value: summary?.totalOrders || 0, 
                  icon: "📦", 
                  color: "#3b82f6",
                  change: comparison?.ordersChange,
                  description: "Jumlah pesanan masuk"
                },
                { 
                  label: "Pesanan Lunas", 
                  value: summary?.totalPaid || 0, 
                  icon: "✅", 
                  color: "#14b8a6",
                  change: null,
                  description: "Pesanan yang sudah dibayar"
                },
                { 
                  label: "Avg Order Value", 
                  value: formatPrice(summary?.avgOrderValue || 0), 
                  icon: "📊", 
                  color: "#f59e0b",
                  change: null,
                  description: "Rata-rata nilai pesanan"
                }
              ].map((card, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: theme.cardBg, 
                    borderRadius: "16px", 
                    padding: "24px", 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: `1px solid ${theme.border}`,
                    transition: "all 0.3s",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ 
                    position: "absolute", 
                    top: "-20px", 
                    right: "-20px", 
                    width: "100px", 
                    height: "100px", 
                    backgroundColor: card.color, 
                    opacity: 0.1, 
                    borderRadius: "50%" 
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ fontSize: "13px", color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
                    <div style={{ fontSize: "32px" }}>{card.icon}</div>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: theme.text, marginBottom: "8px" }}>{card.value}</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "8px" }}>{card.description}</div>
                  {card.change !== null && card.change !== undefined && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      fontSize: "13px", 
                      fontWeight: "600",
                      color: parseFloat(card.change) >= 0 ? theme.success : theme.danger
                    }}>
                      <span>{parseFloat(card.change) >= 0 ? "📈" : "📉"}</span>
                      <span>{Math.abs(parseFloat(card.change))}% vs periode sebelumnya</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "32px" }}>
              {/* Recent Orders */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📋</span> Pesanan Terbaru
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                  {checkouts.slice(0, 5).map((checkout, idx) => {
                    const statusStyle = getStatusColor(checkout.status);
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "16px", 
                          backgroundColor: theme.bg, 
                          borderRadius: "12px",
                          border: `1px solid ${theme.border}`,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: theme.text, marginBottom: "4px", fontSize: "14px" }}>{checkout.customerName || "Customer"}</div>
                          <div style={{ fontSize: "12px", color: theme.textSecondary }}>{formatDate(checkout.createdAt)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: "700", color: theme.success, marginBottom: "4px", fontSize: "15px" }}>{formatPrice(getOrderTotal(checkout))}</div>
                          <div style={{ 
                            padding: "4px 12px", 
                            backgroundColor: statusStyle.bg, 
                            color: statusStyle.color, 
                            borderRadius: "6px", 
                            fontSize: "11px", 
                            fontWeight: "600",
                            display: "inline-block"
                          }}>
                            {checkout.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Low Stock Alert */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⚠️</span> Stock Rendah
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {products.filter(p => (p.stock || 0) < 10).slice(0, 5).map((product, idx) => (
                    <div key={idx} style={{ 
                      padding: "12px", 
                      backgroundColor: theme.bg, 
                      borderRadius: "10px",
                      borderLeft: `4px solid ${theme.danger}`,
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{ fontWeight: "600", color: theme.text, fontSize: "13px", marginBottom: "4px" }}>{product.name}</div>
                      <div style={{ fontSize: "12px", color: theme.danger, fontWeight: "600" }}>Stock: {product.stock || 0} unit</div>
                    </div>
                  ))}
                  {products.filter(p => (p.stock || 0) < 10).length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textSecondary }}>
                      <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>Semua produk stock aman</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text }}>⚡ Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Tambah Produk", icon: "➕", action: () => { setActiveTab("products"); setShowAddProduct(true); }, color: "#3b82f6" },
                  { label: "Lihat Analytics", icon: "📊", action: () => setActiveTab("analytics"), color: "#10b981" },
                  { label: "Export Laporan", icon: "📄", action: handleExportPDF, color: "#ef4444" },
                  { label: "Refresh Data", icon: "🔄", action: () => window.location.reload(), color: "#f59e0b" }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    style={{
                      padding: "20px",
                      backgroundColor: theme.bg,
                      border: `2px solid ${theme.border}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: theme.text,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = action.color;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.border;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ fontSize: "32px" }}>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: theme.text }}>💳 Daftar Transaksi</h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <input 
                  type="text" 
                  placeholder="Cari transaksi..." 
                  style={{ 
                    padding: "12px 20px", 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: "10px", 
                    fontSize: "14px",
                    width: "300px",
                    backgroundColor: theme.bg,
                    color: theme.text
                  }}
                />
                <select style={{ 
                  padding: "12px 20px", 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: "10px", 
                  fontSize: "14px",
                  backgroundColor: theme.bg,
                  color: theme.text,
                  cursor: "pointer"
                }}>
                  <option>Semua Status</option>
                  <option>PAID</option>
                  <option>PENDING</option>
                  <option>CANCELLED</option>
                </select>
              </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bg, borderBottom: `2px solid ${theme.border}` }}>
                      {["Order ID", "Customer", "Tanggal", "Items", "Total", "Status", "Aksi"].map((header, idx) => (
                        <th key={idx} style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: theme.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {checkouts.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "60px 20px", textAlign: "center", color: theme.textSecondary }}>
                          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📭</div>
                          <div style={{ fontSize: "18px", fontWeight: "600" }}>Belum ada transaksi</div>
                        </td>
                      </tr>
                    ) : (
                      checkouts.map((checkout, idx) => {
                        const statusStyle = getStatusColor(checkout.status);
                        return (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: `1px solid ${theme.border}`,
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: "16px 20px", color: theme.text, fontWeight: "600", fontSize: "13px" }}>#{checkout._id?.slice(-6) || idx}</td>
                            <td style={{ padding: "16px 20px", color: theme.text, fontSize: "14px" }}>{checkout.customerName || "Customer"}</td>
                            <td style={{ padding: "16px 20px", color: theme.textSecondary, fontSize: "13px" }}>{formatDate(checkout.createdAt)}</td>
                            <td style={{ padding: "16px 20px", color: theme.text, fontSize: "14px" }}>{checkout.items?.length || 0} item</td>
                            <td style={{ padding: "16px 20px", color: theme.success, fontWeight: "700", fontSize: "15px" }}>{formatPrice(getOrderTotal(checkout))}</td>
                            <td style={{ padding: "16px 20px" }}>
                              <span style={{ padding: "6px 14px", backgroundColor: statusStyle.bg, color: statusStyle.color, borderRadius: "8px", fontSize: "12px", fontWeight: "600", display: "inline-block" }}>
                                {checkout.status}
                              </span>
                            </td>
                            <td style={{ padding: "16px 20px" }}>
                              <button style={{ padding: "8px 16px", backgroundColor: theme.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Detail</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: theme.text }}>📦 Manajemen Produk</h2>
              <button 
                onClick={() => setShowAddProduct(true)} 
                style={{ 
                  padding: "12px 24px", 
                  backgroundColor: theme.primary, 
                  color: "white", 
                  border: "none", 
                  borderRadius: "10px", 
                  cursor: "pointer", 
                  fontWeight: "600", 
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                ➕ Tambah Produk
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input 
                type="text" 
                placeholder="Cari produk..." 
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                style={{ 
                  flex: 1,
                  padding: "12px 20px", 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: "10px", 
                  fontSize: "14px",
                  backgroundColor: theme.bg,
                  color: theme.text
                }}
              />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ 
                  padding: "12px 20px", 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: "10px", 
                  fontSize: "14px",
                  backgroundColor: theme.bg,
                  color: theme.text,
                  cursor: "pointer",
                  minWidth: "150px"
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "all" ? "Semua Kategori" : cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filteredProducts.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: theme.textSecondary }}>
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                    {searchProduct || filterCategory !== "all" ? "Produk tidak ditemukan" : "Belum ada produk"}
                  </div>
                  {!searchProduct && filterCategory === "all" && (
                    <button 
                      onClick={() => setShowAddProduct(true)} 
                      style={{ padding: "12px 24px", backgroundColor: theme.primary, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginTop: "12px" }}
                    >
                      ➕ Tambah Produk
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div 
                    key={product._id} 
                    style={{ 
                      backgroundColor: theme.cardBg,
                      border: `2px solid ${theme.border}`, 
                      borderRadius: "16px", 
                      padding: "24px",
                      transition: "all 0.3s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                      e.currentTarget.style.borderColor = theme.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = theme.border;
                    }}
                  >
                    <div style={{ 
                      width: "100%", 
                      height: "180px", 
                      backgroundColor: theme.bg, 
                      borderRadius: "12px", 
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "64px"
                    }}>
                      📦
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: theme.text }}>{product.name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: theme.success }}>{formatPrice(product.price)}</div>
                      <div style={{ 
                        padding: "6px 12px", 
                        backgroundColor: (product.stock || 0) > 20 ? "#dcfce7" : (product.stock || 0) > 10 ? "#fef3c7" : "#fee2e2", 
                        color: (product.stock || 0) > 20 ? "#15803d" : (product.stock || 0) > 10 ? "#b45309" : "#b91c1c", 
                        borderRadius: "8px", 
                        fontSize: "13px", 
                        fontWeight: "600"
                      }}>
                        Stock: {product.stock || 0}
                      </div>
                    </div>
                    <div style={{ 
                      padding: "6px 12px", 
                      backgroundColor: theme.bg, 
                      borderRadius: "8px", 
                      fontSize: "12px", 
                      fontWeight: "600",
                      color: theme.textSecondary,
                      marginBottom: "16px",
                      display: "inline-block"
                    }}>
                      🏷️ {product.category || "Other"}
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)} 
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        backgroundColor: theme.danger, 
                        color: "white", 
                        border: "none", 
                        borderRadius: "10px", 
                        cursor: "pointer", 
                        fontWeight: "600", 
                        fontSize: "14px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.danger}
                    >
                      🗑️ Hapus Produk
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB - Enhanced Version */}
        {activeTab === "analytics" && (
          <div>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "700", color: theme.text }}>📈 Analytics & Insights</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
              
              {/* Daily Revenue Chart with Enhanced Interactivity */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: theme.text }}>📈 Omzet Per Hari (7 Hari)</h3>
                  {comparison?.omzetChange && (
                    <div style={{ 
                      padding: "6px 12px", 
                      backgroundColor: parseFloat(comparison.omzetChange) >= 0 ? "#dcfce7" : "#fee2e2",
                      color: parseFloat(comparison.omzetChange) >= 0 ? "#15803d" : "#b91c1c",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {parseFloat(comparison.omzetChange) >= 0 ? "📈" : "📉"} {Math.abs(parseFloat(comparison.omzetChange))}%
                    </div>
                  )}
                </div>
                <div style={{ height: "300px", display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px", position: "relative" }}>
                  {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
                    analytics.dailyRevenue.map((item, idx) => {
                      const maxVal = Math.max(...analytics.dailyRevenue.map(d => d.amount), 1);
                      const height = (item.amount / maxVal) * 250;
                      const isHovered = hoveredChart === `daily-${idx}`;
                      return (
                        <div key={idx} style={{ flex: 1, position: "relative" }}>
                          <div 
                            style={{ 
                              height: `${height}px`, 
                              backgroundColor: isHovered ? theme.primary : theme.success,
                              borderRadius: "8px 8px 0 0", 
                              cursor: "pointer", 
                              transition: "all 0.3s",
                              transform: isHovered ? "scale(1.05)" : "scale(1)"
                            }} 
                            onMouseEnter={() => setHoveredChart(`daily-${idx}`)}
                            onMouseLeave={() => setHoveredChart(null)}
                          />
                          {isHovered && (
                            <div style={{
                              position: "absolute",
                              bottom: `${height + 10}px`,
                              left: "50%",
                              transform: "translateX(-50%)",
                              backgroundColor: "rgba(0,0,0,0.9)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              zIndex: 10
                            }}>
                              {formatPrice(item.amount)}
                            </div>
                          )}
                          <div style={{ textAlign: "center", marginTop: "8px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary }}>{item.day}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ width: "100%", textAlign: "center", color: theme.textSecondary, paddingTop: "100px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>Belum ada data 7 hari terakhir</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: "8px", border: `1px solid ${theme.border}`, fontSize: "14px", color: theme.text, fontWeight: "600" }}>
                  💰 Total Minggu: <span style={{ color: theme.success }}>{formatPrice(analytics?.weeklyTotal || 0)}</span>
                </div>
              </div>

              {/* Status Distribution */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text }}>📊 Status Transaksi</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "✅ PAID", value: summary?.totalPaid || 0, total: summary?.totalOrders || 1, color: theme.success },
                    { label: "⏳ PENDING", value: summary?.totalPending || 0, total: summary?.totalOrders || 1, color: theme.warning },
                    { label: "❌ CANCELLED", value: summary?.totalCancelled || 0, total: summary?.totalOrders || 1, color: theme.danger }
                  ].map((item, idx) => {
                    const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                          <span style={{ fontWeight: "600", color: theme.text }}>{item.label}</span>
                          <span style={{ color: theme.textSecondary, fontWeight: "600" }}>{item.value} / {item.total} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div style={{ width: "100%", height: "10px", backgroundColor: theme.bg, borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            height: "100%", 
                            backgroundColor: item.color, 
                            transition: "width 0.5s ease",
                            borderRadius: "10px"
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Sales */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text }}>💳 Penjualan Per Bulan</h3>
                <div style={{ height: "250px", display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
                  {analytics?.monthlyRevenue && analytics.monthlyRevenue.length > 0 ? (
                    analytics.monthlyRevenue.map((item, idx) => {
                      const maxVal = Math.max(...analytics.monthlyRevenue.map(m => m.amount), 1);
                      const height = (item.amount / maxVal) * 200;
                      const isHovered = hoveredChart === `monthly-${idx}`;
                      return (
                        <div key={idx} style={{ flex: 1, position: "relative" }}>
                          <div 
                            style={{ 
                              height: `${height}px`, 
                              backgroundColor: isHovered ? "#1d4ed8" : theme.primary,
                              borderRadius: "6px 6px 0 0", 
                              cursor: "pointer", 
                              transition: "all 0.3s",
                              transform: isHovered ? "scale(1.05)" : "scale(1)"
                            }} 
                            onMouseEnter={() => setHoveredChart(`monthly-${idx}`)}
                            onMouseLeave={() => setHoveredChart(null)}
                          />
                          {isHovered && (
                            <div style={{
                              position: "absolute",
                              bottom: `${height + 10}px`,
                              left: "50%",
                              transform: "translateX(-50%)",
                              backgroundColor: "rgba(0,0,0,0.9)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              zIndex: 10
                            }}>
                              {formatPrice(item.amount)}
                            </div>
                          )}
                          <div style={{ textAlign: "center", marginTop: "6px", fontSize: "11px", fontWeight: "600", color: theme.textSecondary }}>{item.month}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ width: "100%", textAlign: "center", color: theme.textSecondary, paddingTop: "80px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>Belum ada data bulanan</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: "8px", border: `1px solid ${theme.border}`, fontSize: "14px", color: theme.text, fontWeight: "600" }}>
                  📊 Total YTD: <span style={{ color: theme.primary }}>{formatPrice(analytics?.yearlyTotal || 0)}</span>
                </div>
              </div>

              {/* Top Products */}
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700", color: theme.text }}>🏆 Produk Terpopuler</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.slice(0, 5).map((item, idx) => {
                      const colors = [theme.danger, "#f97316", theme.warning, theme.success, theme.primary];
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            padding: "16px", 
                            backgroundColor: theme.bg, 
                            borderRadius: "12px", 
                            borderLeft: `5px solid ${colors[idx]}`,
                            transition: "all 0.2s",
                            cursor: "pointer"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(8px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: theme.text, marginBottom: "4px" }}>
                              <span style={{ fontSize: "18px", marginRight: "8px" }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][idx]}</span>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "13px", color: theme.textSecondary, fontWeight: "600" }}>Terjual: {item.totalSold} unit</div>
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: theme.success, textAlign: "right" }}>{formatPrice(item.revenue)}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: theme.textSecondary }}>
                      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📦</div>
                      <div style={{ fontSize: "16px", fontWeight: "600" }}>Belum ada data penjualan</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
                {[
                  { label: "Avg Order Value", value: formatPrice(summary?.avgOrderValue || 0), icon: "💰", trend: "+12%", positive: true, color: theme.success },
                  { label: "Conversion Rate", value: analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%", icon: "📊", trend: "+5%", positive: true, color: theme.primary },
                  { label: "Customer Baru", value: analytics?.newCustomers || 0, icon: "👥", trend: "+8%", positive: true, color: theme.warning },
                  { label: "Total Produk", value: products.length, icon: "📦", trend: `${products.filter(p => (p.stock || 0) < 10).length} low stock`, positive: false, color: theme.danger }
                ].map((metric, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      backgroundColor: theme.cardBg, 
                      borderRadius: "16px", 
                      padding: "24px", 
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
                      borderTop: `4px solid ${metric.color}`,
                      border: `1px solid ${theme.border}`,
                      transition: "all 0.3s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ fontSize: "13px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{metric.label}</div>
                      <div style={{ fontSize: "28px" }}>{metric.icon}</div>
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: theme.text, marginBottom: "8px" }}>{metric.value}</div>
                    <div style={{ fontSize: "13px", color: metric.positive ? theme.success : theme.danger, fontWeight: "600" }}>
                      {metric.positive ? "📈" : "⚠️"} {metric.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: theme.cardBg, borderRadius: "20px", padding: "32px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, animation: "modalSlideIn 0.3s ease" }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "700", color: theme.text }}>➕ Tambah Produk Baru</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.text }}>Nama Produk</label>
                <input type="text" placeholder="Masukkan nama produk" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "14px", backgroundColor: theme.bg, color: theme.text }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.text }}>Harga (IDR)</label>
                <input type="number" placeholder="100000" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "14px", backgroundColor: theme.bg, color: theme.text }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.text }}>Stock</label>
                <input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "14px", backgroundColor: theme.bg, color: theme.text }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.text }}>Kategori</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "14px", backgroundColor: theme.bg, color: theme.text, cursor: "pointer" }}>
                  <option value="">Pilih kategori</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button onClick={handleAddProduct} style={{ flex: 1, padding: "14px", backgroundColor: theme.primary, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>✅ Simpan</button>
                <button onClick={() => { setShowAddProduct(false); setNewProduct({ name: "", price: "", stock: "", category: "" }); }} style={{ flex: 1, padding: "14px", backgroundColor: theme.danger, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>❌ Batal</button>
              </div>
            </div>
          </div>
          <style>{`@keyframes modalSlideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
}