import { useEffect, useState } from "react";

export default function Dashboard() {
  const [checkouts, setCheckouts] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [resCheckout, resProducts, resSummary] = await Promise.all([
          fetch("/api/checkout/list"),
          fetch("/api/products"),
          fetch("/api/analytics/summary"),
        ]);

        const [checkoutData, productData, summaryData] = await Promise.all([
          resCheckout.json(),
          resProducts.json(),
          resSummary.json(),
        ]);

        setCheckouts(checkoutData.data || []);
        setProducts(productData.data || []);
        setSummary(summaryData.data || null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>Admin Dashboard</h1>

      {/* Cards ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px #0001" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Total Produk</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{products.length}</div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px #0001" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Total Order</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{summary?.totalOrders ?? checkouts.length}</div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px #0001" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Total Omzet</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            Rp {(summary?.totalOmzet ?? 0).toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Tabel transaksi */}
      <section style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px #0001", padding: 16, marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12, fontSize: 18 }}>💳 Transaksi Terbaru</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Tanggal</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Items</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((c) => (
                <tr key={c._id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: 8 }}>{new Date(c.createdAt).toLocaleString("id-ID")}</td>
                  <td style={{ padding: 8 }}>{c.userEmail || "-"}</td>
                  <td style={{ padding: 8 }}>{c.items?.map(i => `${i.name}×${i.quantity}`).join(", ")}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 999, fontSize: 12,
                      background: c.status === "PAID" ? "#e6ffed" : c.status === "PENDING_PAYMENT" ? "#fff7e6" : "#f3f4f6",
                      color: c.status === "PAID" ? "#0a7" : c.status === "PENDING_PAYMENT" ? "#b26b00" : "#555"
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>Rp {Number(c.total).toLocaleString("id-ID")}</td>
                </tr>
              ))}
              {checkouts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#888" }}>Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* List produk singkat */}
      <section style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px #0001", padding: 16 }}>
        <h2 style={{ marginBottom: 12, fontSize: 18 }}>📦 Produk</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {products.map((p) => (
            <li key={p._id}>
              {p.name} — Rp {Number(p.price).toLocaleString("id-ID")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}