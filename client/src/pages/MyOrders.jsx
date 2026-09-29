import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    
    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
            navigate('/');
            return;
        }

        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Error parsing user", e);
            navigate('/');
        }

        // Fetch Cart Count
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }

        fetchMyOrders(token);
    }, [navigate]);

    const fetchMyOrders = async (token) => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to fetch your orders.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (orderId) => {
        const token = localStorage.getItem('token');
        setModalLoading(true);
        setIsModalOpen(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSelectedOrder(res.data);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            setToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load order details.'
            });
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Order cancelled successfully.'
                });
                setIsModalOpen(false);
                fetchMyOrders(token);
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            setToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to cancel order.'
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return { color: '#f59e0b', bg: '#fef3c7' };
            case 'Processing': return { color: '#3b82f6', bg: '#eff6ff' };
            case 'Shipped': return { color: '#8b5cf6', bg: '#f5f3ff' };
            case 'Delivered': return { color: '#10b981', bg: '#ecfdf5' };
            case 'Cancelled': return { color: '#ef4444', bg: '#fef2f2' };
            default: return { color: '#6b7280', bg: '#f3f4f6' };
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const paginatedOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-vh-100 bg-light">
            <style>{`
                .order-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .order-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                }
                .status-badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 6px 14px;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    padding: 20px;
                }
                .order-modal {
                    background: white;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                }
                .modal-header-custom {
                    padding: 16px 24px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .modal-body-custom {
                    padding: 24px;
                    overflow-y: auto;
                }
                .item-row {
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .item-row:last-child {
                    border-bottom: none;
                }
                .hover-scale {
                    transition: transform 0.2s ease;
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                }
                .pagination-btn { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #fff; border: none; border-radius: 16px; color: #64748b; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .pagination-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); color: #10B981; }
                .pagination-btn.active { background: #10B981; color: #fff; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
                .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
            `}</style>

            <Navbar 
                user={user}
                cartCount={cartCount}
                navigate={navigate}
                onLogout={handleLogout}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateUser}
            />

            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Order Details Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="order-modal animate__animated animate__zoomIn animate__faster" onClick={e => e.stopPropagation()}>
                        {modalLoading ? (
                            <div className="p-5 text-center">
                                <div className="spinner-border text-success" role="status"></div>
                                <p className="mt-3 text-muted fw-medium">Fetching order details...</p>
                            </div>
                        ) : selectedOrder ? (
                            <>
                                <div className="modal-header-custom d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="small text-muted fw-bold mb-1">ORDER DETAILS</div>
                                        <h4 className="fw-black text-dark mb-0">{selectedOrder.order.order_number}</h4>
                                    </div>
                                    <button 
                                        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="modal-body-custom">
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <div className="small text-muted fw-bold mb-1">STATUS</div>
                                            <span className="status-badge" style={{ 
                                                color: getStatusColor(selectedOrder.order.order_status).color, 
                                                backgroundColor: getStatusColor(selectedOrder.order.order_status).bg 
                                            }}>
                                                {selectedOrder.order.order_status}
                                            </span>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="small text-muted fw-bold mb-1">DATE PLACED</div>
                                            <div className="fw-bold text-dark">
                                                {new Date(selectedOrder.order.created_at).toLocaleString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="small text-muted fw-bold mb-1">PAYMENT</div>
                                            <div className="fw-bold text-dark">{selectedOrder.order.payment_method}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3">Delivery Address</h6>
                                        <div className="p-3 rounded-4 bg-light text-secondary small fw-medium" style={{ lineHeight: '1.6' }}>
                                            <span className="material-symbols-outlined fs-6 align-middle me-2">location_on</span>
                                            {selectedOrder.order.delivery_address}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-2 small uppercase tracking-wider">Order Items</h6>
                                        <div className="border rounded-4 overflow-hidden bg-white">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="item-row px-3 d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold text-dark small">{item.product_name}</div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>Qty: {item.quantity} × Rs. {item.final_price || item.price}</div>
                                                            {item.discount_percent > 0 && (
                                                                <>
                                                                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '10px' }}>Rs. {item.price}</span>
                                                                    <span className="badge bg-danger p-1" style={{ fontSize: '8px' }}>{item.discount_percent}% OFF</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="fw-bold text-dark small">Rs. {(item.final_price || item.price) * item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-4" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary fw-medium">Subtotal</span>
                                            <span className="fw-bold text-dark">Rs. {selectedOrder.order.total_amount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary fw-medium">Delivery Fee</span>
                                            <span className="text-success fw-bold">FREE</span>
                                        </div>
                                        <hr className="my-3" style={{ borderColor: '#dcfce7' }} />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-black mb-0 text-dark">Total Amount</h6>
                                            <h4 className="fw-black mb-0 text-success">Rs. {selectedOrder.order.total_amount}</h4>
                                        </div>
                                    </div>
                                    {selectedOrder.order.order_status === 'Pending' && (
                                        <button 
                                            className="btn btn-danger rounded-pill px-4 py-2 fw-semibold w-100 mt-3 shadow-sm transition-all hover-scale d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => {
                                                setOrderToCancel(selectedOrder.order.order_id);
                                                setShowCancelConfirm(true);
                                            }}
                                        >
                                            <span className="material-symbols-outlined fs-6">cancel</span>
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowCancelConfirm(false)}>
                    <div className="bg-white rounded-4 p-4 text-center animate__animated animate__zoomIn animate__faster" style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                            <span className="material-symbols-outlined text-danger display-5">warning</span>
                        </div>
                        <h4 className="fw-black text-dark mb-2">Cancel Order?</h4>
                        <p className="text-muted small mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="d-flex gap-3">
                            <button 
                                className="btn btn-light flex-grow-1 rounded-pill py-2 fw-bold"
                                onClick={() => setShowCancelConfirm(false)}
                            >
                                No, Keep It
                            </button>
                            <button 
                                className="btn btn-danger flex-grow-1 rounded-pill py-2 fw-bold"
                                onClick={() => {
                                    setShowCancelConfirm(false);
                                    handleCancelOrder(orderToCancel);
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container py-5">
                <div className="row align-items-center mb-5">
                    <div className="col-lg-6">
                        <div className="d-flex align-items-center gap-3">
                            <button 
                                className="btn btn-white bg-white border rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm hover-scale"
                                onClick={() => navigate('/')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <span className="material-symbols-outlined fs-5">arrow_back</span>
                            </button>
                            <div>
                                <h2 className="fw-semibold text-dark mb-0">My Orders</h2>
                                <p className="text-muted mb-0 small fw-medium">Manage and track your grocery orders</p>
                            </div>
                        </div>
                    </div>
                    {!loading && orders.length > 0 && (
                        <div className="col-lg-6 mt-4 mt-lg-0">
                            <div className="row g-3">
                                <div className="col-4">
                                    <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-2">
                                        <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                                            <span className="material-symbols-outlined fs-5">shopping_bag</span>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark leading-tight">{orders.length}</div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>Total</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-2">
                                        <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                                            <span className="material-symbols-outlined fs-5">pending_actions</span>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark leading-tight">
                                                {orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Processing').length}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>Active</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-2">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                            <span className="material-symbols-outlined fs-5">task_alt</span>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark leading-tight">
                                                {orders.filter(o => o.order_status === 'Delivered').length}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>Delivered</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status"></div>
                        <p className="mt-3 text-muted fw-medium">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-5 px-4 bg-white rounded-5 shadow-sm border animate__animated animate__fadeIn max-w-lg mx-auto">
                        <div className="bg-light rounded-circle p-4 d-inline-flex mb-4">
                            <span className="material-symbols-outlined display-3 text-muted opacity-50">shopping_cart_off</span>
                        </div>
                        <h3 className="fw-black text-dark">No orders yet</h3>
                        <p className="text-muted mb-4 px-md-5">You haven't placed any orders yet. Explore our fresh categories and start filling your cart!</p>
                        <button className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-sm transition-all hover-scale" onClick={() => navigate('/')}>
                            Explore Shop
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="row g-3">
                        {paginatedOrders.map((order) => {
                            const { color, bg } = getStatusColor(order.order_status);
                            return (
                                <div className="col-12 animate__animated animate__fadeInUp" key={order.order_id}>
                                    <div className="card order-card bg-white rounded-4 border-0 shadow-sm overflow-hidden" style={{ borderLeft: `6px solid ${color}` }}>
                                        <div className="card-body p-3 p-md-4">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-light rounded-3 p-2 d-flex align-items-center justify-content-center">
                                                            <span className="material-symbols-outlined text-secondary">inventory_2</span>
                                                        </div>
                                                        <div>
                                                            <div className="small text-muted fw-semibold mb-0" style={{ fontSize: '10px', letterSpacing: '1px' }}>ORDER ID</div>
                                                            <div className="fw-semibold text-dark">{order.order_number}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-2 mt-3 mt-md-0">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="material-symbols-outlined text-muted fs-6">calendar_today</span>
                                                        <div>
                                                            <div className="small text-muted fw-semibold" style={{ fontSize: '10px' }}>PLACED ON</div>
                                                            <div className="fw-semibold text-dark small">
                                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-2 mt-3 mt-md-0 text-md-center">
                                                    <div className="d-flex flex-md-column align-items-center gap-2 gap-md-0">
                                                        <div className="small text-muted fw-semibold d-md-block" style={{ fontSize: '10px' }}>TOTAL</div>
                                                        <div className="fw-semibold text-success fs-5">Rs. {order.total_amount}</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mt-3 mt-md-0 text-md-center">
                                                    <div className="small text-muted fw-semibold mb-2 d-none d-md-block" style={{ fontSize: '10px' }}>STATUS</div>
                                                    <span className="status-badge" style={{ color, backgroundColor: bg }}>
                                                        {order.order_status}
                                                    </span>
                                                </div>
                                                <div className="col-md-2 text-md-end mt-3 mt-md-0">
                                                    <button 
                                                        className="btn btn-success rounded-pill px-4 py-2 fw-semibold w-100 shadow-sm transition-all hover-scale d-flex align-items-center justify-content-center gap-2"
                                                        style={{ backgroundColor: '#10B981', border: 'none' }}
                                                        onClick={() => handleViewDetails(order.order_id)}
                                                    >
                                                        <span className="material-symbols-outlined fs-6">visibility</span>
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Centered Pagination */}
                    {orders.length > 0 && (
                        <div className="position-relative d-flex align-items-center justify-content-center mt-5 animate__animated animate__fadeIn" style={{ minHeight: '60px' }}>
                            <div className="d-flex align-items-center gap-2">
                                <button className="pagination-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><span className="material-symbols-outlined fs-5">chevron_left</span></button>
                                <div className="d-flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                    ))}
                                </div>
                                <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><span className="material-symbols-outlined fs-5">chevron_right</span></button>
                            </div>
                            <div className="position-absolute end-0 d-flex align-items-center gap-3 bg-white p-2 px-4 rounded-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                                <span className="text-muted small fw-bold">SHOW</span>
                                <select className="form-select form-select-sm rounded-3 fw-bold border-0 bg-light shadow-none" style={{ width: '70px', cursor: 'pointer', height: '36px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                    <option value="25">25</option><option value="50">50</option><option value="100">100</option>
                                </select>
                                <span className="text-muted small fw-bold text-uppercase">ENTRIES</span>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
