import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.qty, 0);
  };

  const goToPayment = () => {
    router.push("/payment");
  };

  const goBack = () => {
    router.push("/select");
  };

  // Fungsi untuk mendapatkan path gambar berdasarkan nama produk (UPDATED dengan semua 15 items)
  const getProductImage = (productName) => {
    if (!productName) return null;
    
    // Mapping nama produk ke file gambar - LENGKAP dengan 15 items
    const imageMap = {
      // 8 item original
      'Teh Botol': 'tehbotol.png',
      'Nasi Goreng': 'nasigoreng.png',
      'Keripik': 'keripik.png',
      'Bakmie': 'bakmie.png',
      'Siomay': 'siomay.png',
      'Es Kelapa': 'eskelapa.png',
      'Es Jeruk': 'esjeruk.png',
      'Gado-Gado': 'gadogado.png',
      // 7 item baru
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
            <button 
              onClick={goBack}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >←</button>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0'
              }}>
                📦 Checkout
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                Review your order before payment
              </p>
            </div>
          </div>
          
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
              <div style={{ fontSize: '12px', color: '#64748b' }}>PTVIGWAGON@GMAIL.COM</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          
          {/* Order Items */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🛒 Order Items ({getTotalItems()} items)
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                {cart.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                    <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Your cart is empty</p>
                    <p style={{ fontSize: '14px', margin: '0' }}>Add some items to get started</p>
                  </div>
                ) : (
                  cart.map((c, i) => {
                    const imagePath = getProductImage(c.name);
                    
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: i < cart.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        {/* Product Image */}
                        <div style={{
                          width: '64px',
                          height: '64px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          overflow: 'hidden'
                        }}>
                          {imagePath ? (
                            <img 
                              src={imagePath}
                              alt={c.name}
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
                            fontSize: '24px'
                          }}>
                            📦
                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontWeight: '600',
                            fontSize: '16px',
                            color: '#1f2937',
                            margin: '0 0 4px 0'
                          }}>
                            {c.name}
                          </h3>
                          <div style={{
                            fontSize: '14px',
                            color: '#64748b',
                            marginBottom: '8px'
                          }}>
                            {formatPrice(c.price)} each
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Qty: {c.qty}
                            </span>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div style={{
                          textAlign: 'right'
                        }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#14b8a6'
                          }}>
                            {formatPrice(c.price * c.qty)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              position: 'sticky',
              top: '24px'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💳 Order Summary
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* Summary Details */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#64748b' }}>Subtotal ({getTotalItems()} items)</span>
                    <span style={{ fontWeight: '500' }}>{formatPrice(total)}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#64748b' }}>Shipping</span>
                    <span style={{ 
                      fontWeight: '500',
                      color: '#14b8a6'
                    }}>FREE</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#64748b' }}>Tax</span>
                    <span style={{ fontWeight: '500' }}>{formatPrice(0)}</span>
                  </div>
                </div>
                
                {/* Total */}
                <div style={{
                  padding: '16px 0',
                  borderTop: '2px solid #e2e8f0',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>Total</span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#14b8a6'
                    }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                
                {/* Continue Button */}
                {cart.length > 0 && (
                  <button
                    onClick={goToPayment}
                    style={{
                      width: '100%',
                      backgroundColor: '#f97316',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ea580c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f97316';
                    }}
                  >
                    Continue to Payment →
                  </button>
                )}
                
                {/* Security Badge */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e0f2fe'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    🔒 Secure 256-bit SSL encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}