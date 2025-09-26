import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SelectPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, []);

  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const goToCheckout = () => {
    router.push({
      pathname: "/checkout",
      query: { cart: JSON.stringify(cart) },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Select Items</h1>

      {/* Product List */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white shadow rounded-xl p-4 flex flex-col"
          >
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {p.name}
              </h2>
              <p className="text-sm text-gray-500">{p.category}</p>
              <p className="text-blue-600 font-bold mt-2">
                Rp {p.price}
              </p>
            </div>
            <button
              onClick={() => addToCart(p)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition"
            >
              Add +
            </button>
          </div>
        ))}
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Cart</h2>
          {cart.map((c, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-2"
            >
              <span>
                {c.name} x {c.qty}
              </span>
              <span className="font-semibold">
                Rp {c.price * c.qty}
              </span>
            </div>
          ))}

          <button
            onClick={goToCheckout}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-3 font-semibold transition"
          >
            Continue to Checkout →
          </button>
        </div>
      )}
    </div>
  );
}