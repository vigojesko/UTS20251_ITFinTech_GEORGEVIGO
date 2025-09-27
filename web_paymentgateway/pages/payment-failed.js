export default function PaymentFailed() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>❌ Payment Failed</h1>
      <p>Mohon maaf, pembayaran Anda gagal diproses.</p>
      <a href="/select" style={{ color: "blue", textDecoration: "underline" }}>
        Kembali ke menu
      </a>
    </div>
  );
}