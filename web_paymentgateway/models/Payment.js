import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  external_id: String,
  user_id: String,
  status: { type: String, default: "PENDING" },
  amount: Number,
  paid_amount: Number,
  paid_at: Date,
  payment_method: String,
  payment_channel: String,
  payment_id: String,
  payment_method_id: String,
  merchant_name: String,
  description: String,
  currency: { type: String, default: "IDR" },
  payer_email: String,
  is_high: Boolean,
  created: Date,
  updated: Date,
  payment_details: {
    receipt_id: String,
    source: String
  },
  raw: Object, // Menyimpan seluruh webhook payload untuk backup
}, {
  timestamps: true
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);