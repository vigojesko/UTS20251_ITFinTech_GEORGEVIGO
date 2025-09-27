import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema({
  xenditInvoiceId: { type: String, required: true, unique: true },
  external_id: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  amount: { type: Number, required: true },
  items: [{
    _id: String,
    name: String,
    price: Number,
    qty: Number
  }],
  invoice_url: String,
  expires_at: Date,
  paid_at: Date,
  customer_info: {
    email: { type: String, default: "customer@example.com" }
  }
}, {
  timestamps: true // Otomatis menambahkan createdAt dan updatedAt
});

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);