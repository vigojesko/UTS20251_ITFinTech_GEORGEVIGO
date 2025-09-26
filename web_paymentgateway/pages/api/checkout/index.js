import dbConnect from "@/lib/mongodb";
import Checkout from '../../../models/Checkout';
import Payment from '../../../models/Payment';
import { Xendit } from 'xendit-node';

const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice } = x;
const invoiceAPI = new Invoice();

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') return res.status(405).end();

  const { items, customerEmail } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const checkout = await Checkout.create({
    items,
    total,
    status: 'PENDING',
  });

  try {
    const externalId = `checkout-${checkout._id}-${Date.now()}`;
    const invoice = await invoiceAPI.createInvoice({
      externalID: externalId,
      payerEmail: customerEmail || 'customer@example.com',
      description: `Payment for checkout ${checkout._id}`,
      amount: total,
      successRedirectURL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?checkoutId=${checkout._id}`,
    });

    checkout.xenditInvoiceId = invoice.id || invoice.invoice_id;
    await checkout.save();

    await Payment.create({
      checkoutId: checkout._id,
      invoiceId: invoice.id || invoice.invoice_id,
      amount: total,
      currency: 'IDR',
      status: invoice.status || 'PENDING',
      raw: invoice,
    });

    return res.status(201).json({
      success: true,
      checkout,
      invoiceUrl: invoice.invoice_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}