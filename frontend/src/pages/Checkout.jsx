import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const validCart = cart.filter((item) => item.product && item.product.price);
  const totalAmount = validCart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,13}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone must be a valid 10-13 digit number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    if (validCart.length === 0) {
      setServerError('Your cart is empty. Please add products to checkout.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Razorpay & ShopKart order on backend
      const { data } = await axios.post(
        'http://localhost:5000/orders/create-payment-order',
        {
          shippingAddress: formData
        },
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      // 3. Configure Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'ShopKart',
        description: 'ShopKart Order Payment (Test Mode)',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verifyRes = await axios.post(
              'http://localhost:5000/orders/verify-payment',
              {
                shopKartOrderId: data.shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { withCredentials: true }
            );

            if (verifyRes.data.success) {
              clearCart();
              navigate(`/order-success/${data.shopKartOrderId}`, {
                state: { order: verifyRes.data.order }
              });
            } else {
              setServerError(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (err) {
            setServerError(
              err.response?.data?.message || 'Payment verification failed on the server.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (failureResponse) {
        console.error('Payment failed', failureResponse.error);
        setServerError(
          'Payment failed: ' +
            (failureResponse.error?.description || 'Transaction cancelled') +
            '. Your cart has not been cleared. Please try again.'
        );
        setIsProcessing(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setServerError(err.response?.data?.message || err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  if (cartLoading) {
    return <div className="text-center py-20 text-lg text-gray-600">Loading checkout...</div>;
  }

  if (validCart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">You need items in your cart to proceed with checkout.</p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Checkout</h1>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            Shipping Details
          </h2>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g. Aarav Sharma"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                placeholder="e.g. 22 MG Road, Flat 4B"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.addressLine1 ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    errors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Karnataka"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    errors.state ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode, e.g. 560001"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.pincode ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>

            <div className="pt-4 flex items-center text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Payments are secured with Razorpay Test Mode. No real money will be charged.</span>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Order Summary
            </h2>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1 mb-4">
              {validCart.map((item) => (
                <div key={item.product._id} className="py-3 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded border border-gray-100"
                    />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
