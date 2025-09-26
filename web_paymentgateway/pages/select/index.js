import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SelectPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  // Ambil data produk dari API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, []);

  // Tambah ke cart
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

  // Pindah ke checkout
  const goToCheckout = () => {
    
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/checkout");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Items</h2>
      {products.map((p) => (
        <div key={p._id} style={{ marginBottom: 10 }}>
          <strong>{p.name}</strong> - Rp {p.price}
          <button
            style={{ marginLeft: 10 }}
            onClick={() => addToCart(p)}
          >
            Add
          </button>
        </div>
      ))}

      <h2>Cart</h2>
      {cart.map((c, i) => (
        <div key={i}>
          {c.name} x {c.qty} = Rp {c.price * c.qty}
        </div>
      ))}

      {cart.length > 0 && (
        <button
          style={{ marginTop: 20 }}
          onClick={goToCheckout}
        >
          Continue to Checkout
        </button>
      )}
    </div>
  );
}