import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const router = useRouter();

  // Ambil cart dari localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(savedCart);
    const sum = savedCart.reduce((acc, c) => acc + c.price * c.qty, 0);
    setAmount(sum);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.qty, 0);
  };

  const goBack = () => {
    router.push("/checkout");
  };

  // Panggil API backend untuk bikin invoice Xendit
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
      console.log("Invoice response:", data);
      if (data.success && data.invoice?.invoice_url) {
        // Redirect ke halaman pembayaran Xendit
        window.location.href = data.invoice.invoice_url;
      } else {
        alert("❌ Gagal membuat pembayaran: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Terjadi kesalahan saat membuat pembayaran");
    } finally {
      setLoading(false);
    }
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
                💳 Payment
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                Complete your purchase securely
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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Payment Methods */}
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
                  💳 Payment Method
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* Credit/Debit Card Option */}
                <div 
                  onClick={() => setSelectedMethod('card')}
                  style={{
                    padding: '16px',
                    border: selectedMethod === 'card' ? '2px solid #f97316' : '2px solid #e2e8f0',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    backgroundColor: selectedMethod === 'card' ? '#fff7ed' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #e2e8f0',
                      backgroundColor: selectedMethod === 'card' ? '#f97316' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedMethod === 'card' && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        💳 Credit/Debit Card
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        backgroundColor: '#1a365d',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>VISA</div>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        backgroundColor: '#eb1c26',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>MC</div>
                    </div>
                  </div>
                </div>

                {/* E-Wallet/Bank Transfer Option */}
                <div 
                  onClick={() => setSelectedMethod('ewallet')}
                  style={{
                    padding: '16px',
                    border: selectedMethod === 'ewallet' ? '2px solid #f97316' : '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedMethod === 'ewallet' ? '#fff7ed' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #e2e8f0',
                      backgroundColor: selectedMethod === 'ewallet' ? '#f97316' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedMethod === 'ewallet' && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        📱 E-Wallet / Bank Transfer
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        GoPay, OVO, Dana, Bank Transfer
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        backgroundColor: '#00aa5b',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>GP</div>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        backgroundColor: '#4c3fe0',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>OVO</div>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #e0f2fe'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    🔒 <strong>Your payment is secure</strong>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#0369a1'
                  }}>
                    We use 256-bit SSL encryption to protect your payment information. Your card details are never stored on our servers.
                  </div>
                </div>
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
                  📋 Order Summary
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* Items List */}
                {items.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</div>
                    <p style={{ margin: '0' }}>Cart is empty</p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '24px' }}>
                    {items.map((c, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {c.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            Qty: {c.qty} × {formatPrice(c.price)}
                          </div>
                        </div>
                        <div style={{
                          fontWeight: '600',
                          color: '#14b8a6'
                        }}>
                          {formatPrice(c.price * c.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
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
                    }}>Total Payment</span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#14b8a6'
                    }}>
                      {formatPrice(amount)}
                    </span>
                  </div>
                </div>
                
                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading || amount === 0}
                  style={{
                    width: '100%',
                    backgroundColor: loading || amount === 0 ? '#9ca3af' : '#f97316',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading || amount === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && amount > 0) {
                      e.target.style.backgroundColor = '#ea580c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && amount > 0) {
                      e.target.style.backgroundColor = '#f97316';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Processing...
                    </>
                  ) : (
                    <>🔒 Confirm & Pay</>
                  )}
                </button>

                {/* Payment Methods Logos */}
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    Powered by Xendit
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: 0.7
                  }}>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>VISA</div>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>MASTERCARD</div>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>GOPAY</div>
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

      {/* Loading Animation CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}