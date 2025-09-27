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
    // Note: localStorage digunakan di sini sesuai kode asli
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/checkout");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.qty, 0);
  };

  // Fungsi untuk mendapatkan path gambar berdasarkan nama produk
  const getProductImage = (productName) => {
    if (!productName) return null;
    
    // Mapping nama produk ke file gambar (termasuk 7 item baru)
    const imageMap = {
      'Teh Botol': 'tehbotol.png',
      'Nasi Goreng': 'nasigoreng.png',
      'Keripik': 'keripik.png',
      'Bakmie': 'bakmie.png',
      'Siomay': 'siomay.png',
      'Es Kelapa': 'eskelapa.png',
      'Es Jeruk': 'esjeruk.png',
      'Gado-Gado': 'gadogado.png',
      // 7 makanan/minuman baru
      'Sate Kambing': 'satekambing.png',
      'Sop Kambing': 'sopkambing.png',
      'Ayam Taliwang': 'ayamtaliwang.png',
      'Teh Tarik': 'tehtarik.png',
      'Nasi Bebek Kecombrang': 'nasibebekkecombrang.png',
      'Susu Kacang': 'susukacang.png',
      'Patin Bakar': 'patinbakar.png'
    };

    const imageName = imageMap[productName];
    return imageName ? `/${imageName}` : null;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#e2e8f0',
              borderRadius: '50%',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>🔍</div>
            <input 
              type="text" 
              placeholder="Search products..." 
              style={{
                width: '300px',
                padding: '12px 16px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '25px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px'
            }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Profile Picture - menggunakan pfp.jpg */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #f97316'
              }}>
                <img 
                  src="/pfp.jpg"
                  alt="Profile Picture"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    // Fallback jika gambar tidak ditemukan
                    e.target.style.display = 'none';
                    e.target.parentElement.style.backgroundColor = '#f97316';
                    e.target.parentElement.style.color = 'white';
                    e.target.parentElement.style.fontWeight = 'bold';
                    e.target.parentElement.style.fontSize = '14px';
                    e.target.parentElement.innerHTML = getTotalItems() || 'JD';
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>VIGWAGON</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>PT WAGON NUSANTARA GROUP</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #462f08ff 0%, #c5c222ff 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '200px'
        }}>
          <div style={{
            padding: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ color: 'white', maxWidth: '400px' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                December 12 - 20
              </div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.2',
                margin: '0 0 16px 0'
              }}>
                Enjoy free home delivery in this winter !
              </h1>
              <p style={{
                fontSize: '18px',
                opacity: 0.9,
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                Bakmie, Keripik, dan Kopi: Peta jalan rasa Indonesia dalam satu kedai
              </p>
              <button style={{
                backgroundColor: '#6a5757ff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Get Started
              </button>
            </div>
            {/* Camera/Personal Image - menggunakan cns.jpg */}
            <div style={{
              width: '250px',
              height: '180px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src="/cns.jpg"
                alt="Personal Photo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  // Fallback jika gambar tidak ditemukan
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '📷';
                  e.target.parentElement.style.fontSize = '60px';
                }}
              />
            </div>
          </div>
          
          {/* Navigation arrows */}
          <div style={{
            position: 'absolute',
            left: '32px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px'
          }}>‹</div>
          
          <div style={{
            position: 'absolute',
            right: '32px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px'
          }}>›</div>
        </div>
      </div>

      {/* Products Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '32px',
          margin: '0 0 32px 0'
        }}>
          Select Items
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {products.map((p) => {
            const imagePath = getProductImage(p.name);
            
            return (
              <div key={p._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid #e2e8f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                {/* Product Image */}
                <div style={{
                  height: '200px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {imagePath ? (
                    <img 
                      src={imagePath}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                      onError={(e) => {
                        // Fallback jika gambar tidak ditemukan
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon jika gambar tidak ada */}
                  <div style={{
                    display: imagePath ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    fontSize: '40px'
                  }}>
                    📦
                  </div>
                  
                  <button 
                    onClick={() => addToCart(p)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#ffffffff',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    🛒
                  </button>
                </div>
                
                {/* Product Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px',
                    fontSize: '14px',
                    margin: '0 0 8px 0'
                  }}>
                    {p.name}
                  </h3>
                  
                  {/* Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    gap: '4px'
                  }}>
                    <div style={{ color: '#fbbf24', fontSize: '12px' }}>
                      ★★★★☆
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>(155)</span>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => addToCart(p)}
                    style={{
                      width: '100%',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f97316';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    <span>🛒</span>
                    Add to Cart
                  </button>
                  
                  {/* Price */}
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#14b8a6'
                  }}>
                    {formatPrice(p.price)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Skeleton */}
          {products.length === 0 && (
            Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '200px',
                  backgroundColor: '#e2e8f0',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{ padding: '16px' }}>
                  <div style={{
                    height: '16px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    height: '12px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    height: '32px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    height: '24px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shopping Cart Fixed */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1px solid #e2e8f0',
          width: '320px',
          maxHeight: '400px',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛒 Cart ({getTotalItems()})
          </div>
          
          <div style={{
            padding: '16px',
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            {cart.map((c, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < cart.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Qty: {c.qty}
                  </div>
                </div>
                <div style={{
                  color: '#14b8a6',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {formatPrice(c.price * c.qty)}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontWeight: 'bold' }}>Total:</span>
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#14b8a6'
              }}>
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <button
              onClick={goToCheckout}
              style={{
                width: '100%',
                backgroundColor: '#f97316',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ea580c';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f97316';
              }}
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Adobe Stock Badge */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        Adobe Stock | #398084924
      </div>

      {/* Add CSS Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}