import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Calendar, ChevronRight, AlertCircle, ShoppingBag, Loader2, RefreshCw } from 'lucide-react';

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PLACED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING_PAYMENT':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('http://localhost:5000/orders', {
        withCredentials: true
      });
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-xl shadow-sm border border-red-200 p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Orders</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You have not placed any orders yet.</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Explore our collection and find high quality tech and lifestyle products today.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed with ShopKart
          </p>
        </div>
        <button
          onClick={fetchOrders}
          title="Refresh orders"
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition duration-150"
            >
              {/* Order Card Header */}
              <div className="p-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 text-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-xs uppercase text-gray-400 font-bold block">Order Placed</span>
                    <span className="font-medium text-gray-800 flex items-center mt-0.5">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {dateStr}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400 font-bold block">Total</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400 font-bold block">Ship To</span>
                    <span className="text-gray-700 font-medium mt-0.5 block line-clamp-1">
                      {order.shippingAddress?.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status || 'PLACED'}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
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
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Qty: <span className="font-medium text-gray-700">{item.quantity}</span> × ₹
                          {item.price?.toLocaleString('en-IN')}
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
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
