export default function PaymentSuccess() {
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
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #14b8a6'
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
                    e.target.style.display = 'none';
                    e.target.parentElement.style.backgroundColor = '#14b8a6';
                    e.target.parentElement.style.color = 'white';
                    e.target.parentElement.style.fontWeight = 'bold';
                    e.target.parentElement.style.fontSize = '14px';
                    e.target.parentElement.innerHTML = 'JD';
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

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Success Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#9ded9bff',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px'
          }}>
            ✅
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Payment Success!
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            Terima kasih! Pembayaran Anda telah berhasil diproses.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#30be2eff',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '20px' }}>🚀</span>
            Pesanan sedang diproses
          </div>
        </div>

        {/* Order Summary Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #462f08ff 0%, #c5c222ff 100%)',
            color: 'white',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Pesanan Berhasil
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: '0'
              }}>
                Pesanan Anda sedang diproses
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px'
            }}>
              📋
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '18px',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Terima kasih telah memesan!
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                Kami akan segera memproses pesanan Anda
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Informasi Pesanan:
          </h4>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#14b8a6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                💳
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>Status Pembayaran</div>
                <div style={{ color: '#64748b' }}>Berhasil</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                📍
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>Status Pesanan</div>
                <div style={{ color: '#64748b' }}>Sedang Diproses</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#8b5cf6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                ⏱️
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>Estimasi Pengiriman</div>
                <div style={{ color: '#64748b' }}>30-45 menit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/select" 
            style={{
              backgroundColor: '#f97316',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}
          >
            🍽️ Kembali ke Menu
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '32px',
        color: '#64748b',
        fontSize: '16px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          Email konfirmasi telah dikirim ke alamat email Anda
        </p>
        <p style={{ margin: '0' }}>
          Butuh bantuan? Hubungi customer service kami di{' '}
          <span style={{ color: '#14b8a6', fontWeight: '600' }}>0800-123-456</span>
        </p>
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