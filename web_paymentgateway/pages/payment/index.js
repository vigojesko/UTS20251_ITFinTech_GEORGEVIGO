import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Ambil cart dari localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(savedCart);
    const sum = savedCart.reduce((acc, c) => acc + c.price * c.qty, 0);
    setAmount(sum);
  }, []);

  // Panggil API backend untuk bikin invoice Xendit
  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: items,
          total: amount,
        }),
      });

      const data = await res.json();
      console.log("Invoice response:", data);

      if (data.success && data.invoice?.invoice_url) {
        // Redirect ke halaman pembayaran Xendit
        window.location.href = data.invoice.invoice_url;
      } else {
        alert("❌ Gagal membuat pembayaran: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Terjadi kesalahan saat membuat pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Payment</h2>

      {items.length === 0 && <p>Cart masih kosong</p>}

      {items.map((c, i) => (
        <div key={i}>
          {c.name} x {c.qty} = Rp {(c.price * c.qty).toLocaleString()}
        </div>
      ))}

      <h3>Total: Rp {amount.toLocaleString()}</h3>

      <div style={{ marginTop: 20 }}>
        <label>
          <input type="radio" name="method" defaultChecked /> Credit/Debit Card
        </label>
        <br />
        <label>
          <input type="radio" name="method" /> E-Wallet / Bank Transfer
        </label>
      </div>

      <button
        style={{ marginTop: 20 }}
        onClick={handlePayment}
        disabled={loading || amount === 0}
      >
        {loading ? "Processing..." : "Confirm & Pay"}
      </button>
    </div>
  );
}