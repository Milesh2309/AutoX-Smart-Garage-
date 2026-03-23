import React, { useState } from 'react';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function ServicePayment() {
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    try {
      setMessage('');

      if (!serviceName.trim() || Number(amount) <= 0) {
        setMessage('Enter valid service name and amount.');
        return;
      }

      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout script');
      }

      const createPaymentResponse = await fetch(`${API_BASE_URL}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_name: serviceName.trim(),
          amount: Number(amount),
        }),
      });

      const createPaymentResult = await createPaymentResponse.json();
      if (!createPaymentResponse.ok || !createPaymentResult?.success) {
        throw new Error(createPaymentResult?.message || 'Failed to create payment order');
      }

      const orderData = createPaymentResult.data;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Service Payment',
        description: serviceName.trim(),
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                service_name: serviceName.trim(),
                amount: Number(amount),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyResult?.success) {
              throw new Error(verifyResult?.message || 'Payment verification failed');
            }

            setMessage('Payment successful and verified.');
          } catch (verifyError) {
            setMessage(verifyError.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        const errorMessage = response?.error?.description || 'Payment failed';
        setMessage(errorMessage);
      });
      razorpay.open();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Service Payment</h2>
      <div>
        <label htmlFor="serviceName">Service Name</label>
        <input
          id="serviceName"
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="e.g. Booking Fee"
        />
      </div>

      <div>
        <label htmlFor="amount">Amount (INR)</label>
        <input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 499"
        />
      </div>

      <button type="button" onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      {message ? <p>{message}</p> : null}
    </div>
  );
}

export default ServicePayment;