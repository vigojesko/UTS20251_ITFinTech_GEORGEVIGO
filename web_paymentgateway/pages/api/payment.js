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

    if (data.success) {
      window.location.href = data.invoice.invoice_url; // redirect ke Xendit invoice
    } else {
      alert("Gagal membuat pembayaran: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat membuat pembayaran");
  } finally {
    setLoading(false);
  }
};