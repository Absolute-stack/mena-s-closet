import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../components/ShopContext';
import { toast } from 'react-toastify';

function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext);
  const [status, setStatus] = useState('verifying'); // verifying, success, failed

  useEffect(() => {
    const reference = searchParams.get('reference');
    const success = searchParams.get('success');

    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/');
      return;
    }

    if (success === 'true') {
      // Payment already verified by PlaceOrders component
      setStatus('success');
      clearCart();

      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } else {
      // Verify payment with backend
      verifyPayment(reference);
    }
  }, [searchParams, navigate, clearCart]);

  async function verifyPayment(reference) {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backend}/api/order/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        clearCart();
        toast.success('Payment verified successfully!');

        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setStatus('failed');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      toast.error('Failed to verify payment');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner}></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={{ color: '#22c55e' }}>Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            <p>Redirecting to your orders...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={styles.errorIcon}>✗</div>
            <h2 style={{ color: '#ef4444' }}>Payment Failed</h2>
            <p>We couldn't verify your payment.</p>
            <button onClick={() => navigate('/')} style={styles.button}>
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  spinner: {
    width: '60px',
    height: '60px',
    margin: '0 auto 20px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    backgroundColor: '#22c55e',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  errorIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  button: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

// Add keyframes animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,
  styleSheet.cssRules.length
);

export default Verify;
