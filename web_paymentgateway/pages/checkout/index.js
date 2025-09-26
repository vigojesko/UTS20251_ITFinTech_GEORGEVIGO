import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const goToPayment = () => {
    router.push("/payment");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Checkout</h2>

      <div className="bg-white shadow-lg rounded-xl p-4">
        {cart.map((c, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>
              {c.name} x {c.qty}
            </span>
            <span className="font-semibold">Rp {(c.price * c.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between mt-3 text-lg font-bold">
          <span>Total:</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>
      </div>

      {cart.length > 0 && (
        <button
          onClick={goToPayment}
          className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue to Payment →
        </button>
      )}
    </div>
  );
}