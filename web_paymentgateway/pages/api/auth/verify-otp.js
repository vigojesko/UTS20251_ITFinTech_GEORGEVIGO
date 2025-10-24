import { useState } from "react";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Verifikasi sukses! Selamat datang 🙌");
      window.location.href = "/"; // ke halaman utama
    } else {
      setMessage("Kode OTP salah atau sudah kadaluarsa.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Verifikasi OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Masukkan kode OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        /><br />
        <button type="submit">Verifikasi</button>
      </form>
      <p>{message}</p>
    </div>
  );
}