import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, CreditCard, Loader2 } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/orders/${id}`, {
            withCredentials: true
          });
          if (data.success) {
            setOrder(data.order);
          } else {
            setError(data.message || 'Failed to load order');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-lg">Fetching your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'Could not retrieve confirmation details.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Thank you for shopping with ShopKart. Your payment has been verified and your order is being processed.
        </p>

        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700">
          <span>Order ID:</span>
          <span className="font-mono font-semibold text-gray-900">{order._id}</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Package className="w-4 h-4 mr-2" />
            View My Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {/* Status & Summary Header */}
        <div className="p-6 sm:p-8 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Status</p>
            <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              {order.status || 'PLACED'}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Payment</p>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {order.paymentStatus || 'PAID'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total Amount</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              ₹{order.totalAmount?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Purchased Items Snapshot */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Purchased Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right font-bold text-gray-900">
                  ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
          <div>
            <div className="flex items-center text-sm font-bold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" /> Shipping Address
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-xs text-gray-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm font-bold text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 mr-2 text-blue-600" /> Payment Information
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium text-gray-700">Method:</span> Razorpay Standard
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs font-mono text-gray-500 break-all">
                  <span className="font-medium text-gray-700 font-sans">Payment ID:</span> {order.razorpayPaymentId}
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="text-xs font-mono text-gray-500 break-all">
                  <span className="font-medium text-gray-700 font-sans">Razorpay Order ID:</span> {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
