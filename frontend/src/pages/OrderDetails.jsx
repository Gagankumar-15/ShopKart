import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Truck,
  Box,
  Clock
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Box },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Package }
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`http://localhost:5000/orders/${id}`, {
        withCredentials: true
      });
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await axios.patch(
        `http://localhost:5000/orders/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-xl shadow-sm border border-red-200 p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Available</h2>
        <p className="text-gray-600 mb-6">{error || 'Unable to display order details.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Orders
        </Link>
        <div className="flex flex-wrap justify-between items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Order #{order._id}
            </h1>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>

          {/* Bonus status progression selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="PLACED">PLACED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Progression Tracker (Bonus Feature) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6">Delivery Progression</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center text-center p-3 rounded-lg border transition ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50'
                    : isCompleted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200 bg-gray-50/40 text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200 mb-8">
        {/* Items List */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Items in this Order</h2>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
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

          <div className="border-t border-gray-200 mt-6 pt-4 flex justify-between items-center text-lg font-extrabold text-gray-900">
            <span>Total Paid</span>
            <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Shipping and Payment Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
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
              <CreditCard className="w-4 h-4 mr-2 text-blue-600" /> Payment Details
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium text-gray-700">Payment Status:</span>{' '}
                <span className="font-semibold text-green-700">{order.paymentStatus}</span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs font-mono text-gray-500 break-all">
                  <span className="font-medium text-gray-700 font-sans">Payment ID:</span> {order.razorpayPaymentId}
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="text-xs font-mono text-gray-500 break-all">
                  <span className="font-medium text-gray-700 font-sans">Razorpay Order:</span> {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
