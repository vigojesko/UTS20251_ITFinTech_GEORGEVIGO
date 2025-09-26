import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { cart, total } = req.body;

      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id: "order-" + Date.now(),
          amount: total,
          payer_email: "customer@example.com",
          description: "Pembayaran order di web_paymentgateway",
        },
        {
          auth: {
            username: process.env.XENDIT_SECRET_KEY,
            password: "",
          },
        }
      );

      return res.status(200).json({ success: true, invoice: response.data });
    } catch (err) {
      console.error(err.response?.data || err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}