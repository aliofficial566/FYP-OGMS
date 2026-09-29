import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }
        setAdmin(user);
        fetchOrders(token);
    }, [navigate, token]);

    const fetchOrders = async (token) => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            showToast('error', 'Error', 'Failed to load orders from server.');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewDetails = async (orderId) => {
        setModalLoading(true);
        setShowDetailsModal(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSelectedOrderDetails(res.data);
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to load order details.');
            setShowDetailsModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;
        try {
            const res = await axios.put(`http://localhost:5000/api/orders/${selectedOrder.order_id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                showToast('success', 'Success', 'Order status updated.');
                setShowStatusModal(false);
                fetchOrders(token);
            }
        } catch (error) {
            showToast('error', 'Error', error.response?.data?.message || 'Failed to update status.');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'admin-badge-pending';
            case 'Processing': return 'admin-badge-info';
            case 'Shipped': return 'admin-badge-info';
            case 'Delivered': return 'admin-badge-success';
            case 'Cancelled': return 'admin-badge-danger';
            default: return 'admin-badge-info';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return { bg: '#fff7ed', text: '#ea580c' }; // Orange
            case 'processing': return { bg: '#eff6ff', text: '#2563eb' }; // Blue
            case 'shipped': return { bg: '#f0f9ff', text: '#0ea5e9' }; // Light Blue
            case 'delivered': return { bg: '#f0fdf4', text: '#16a34a' }; // Green
            case 'cancelled': return { bg: '#fef2f2', text: '#dc2626' }; // Red
            default: return { bg: '#f8fafc', text: '#64748b' }; // Grey
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              order.email?.toLowerCase().includes(searchTerm.toLowerCase());
                              
        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        return order.order_status.toLowerCase() === activeTab.toLowerCase();
    });

    // Stats for tabs
    const getCount = (status) => {
        if (status === 'all') return orders.length;
        return orders.filter(o => o.order_status.toLowerCase() === status.toLowerCase()).length;
    };

    // Sorting Logic
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle specific keys
        if (sortConfig.key === 'customer_name') {
            valA = a.customer_name;
            valB = b.customer_name;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
    const paginatedOrders = sortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="admin-dashboard-container">
            {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
            <AdminSidebar />
            <main className="admin-main-content">
                <AdminHeader admin={admin} onLogout={handleLogout} />
                <div className="p-5">
                    <div className="d-flex justify-content-between align-items-center mb-5 animate-fade">
                        <div>
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Order Management</h2>
                            <p className="text-muted fw-semibold mb-0">Real-time tracking and processing of all customer orders.</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="search-container shadow-sm rounded-pill" style={{ width: '300px', background: '#fff' }}>
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search orders, customers..."
                                    style={{ background: 'transparent', border: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs with Counts */}
                    <div className="d-flex border-bottom mb-4 overflow-auto scrollbar-hidden">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(tab => (
                            <button
                                key={tab}
                                className={`btn border-0 py-3 px-4 fw-bold text-uppercase position-relative transition-all d-flex align-items-center gap-2 ${activeTab === tab ? 'text-success' : 'text-muted'}`}
                                style={{ fontSize: '11px', letterSpacing: '0.05em', minWidth: '150px' }}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            >
                                {tab}
                                <span 
                                    className="badge rounded-pill fw-semibold" 
                                    style={{ 
                                        fontSize: '10px', 
                                        padding: '4px 8px',
                                        background: getStatusBadgeColor(tab).bg,
                                        color: getStatusBadgeColor(tab).text
                                    }}
                                >
                                    {getCount(tab)}
                                </span>
                                {activeTab === tab && <div className="position-absolute bottom-0 start-0 w-100 bg-success" style={{ height: '3px' }}></div>}
                            </button>
                        ))}
                    </div>

                    <div className="admin-table-container animate-fade">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('order_number')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">Order # <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'order_number' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th onClick={() => handleSort('customer_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">Customer <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'customer_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">Date <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th onClick={() => handleSort('total_amount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">Total <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'total_amount' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-success"></div></td></tr>
                                ) : paginatedOrders.map((order) => (
                                    <tr key={order.order_id}>
                                        <td className="fw-bold">
                                            <button className="btn btn-link p-0 fw-semibold text-success text-decoration-none" onClick={() => handleViewDetails(order.order_id)} style={{ fontSize: '1.05rem' }}>
                                                {order.order_number}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{order.customer_name}</div>
                                            <div className="text-muted small fw-semibold">{order.email}</div>
                                        </td>
                                        <td className="text-muted fw-bold small">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="fw-semibold text-dark">Rs. {order.total_amount}</td>
                                        <td>
                                            <span className={`admin-badge ${getStatusClass(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                            {order.order_status === 'Cancelled' && order.cancelled_by && (
                                                <div className="text-muted small fw-bold mt-1" style={{ fontSize: '11px' }}>By: {order.cancelled_by}</div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-light btn-sm rounded-3 fw-bold d-inline-flex align-items-center gap-2 px-3 py-2"
                                                style={{ color: 'var(--admin-primary)' }}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setNewStatus(order.order_status);
                                                    setShowStatusModal(true);
                                                }}
                                            >
                                                <span className="material-symbols-outlined fs-6">sync_alt</span>
                                                Update Status
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && paginatedOrders.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted fw-semibold">No orders found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Centered Pagination */}
                    {filteredOrders.length > 0 && (
                        <div className="position-relative d-flex align-items-center justify-content-center mt-5 animate-fade" style={{ minHeight: '60px' }}>
                            <div className="d-flex align-items-center gap-2">
                                <button className="admin-pagination-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><span className="material-symbols-outlined fs-5">chevron_left</span></button>
                                <div className="d-flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1} className={`admin-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                    ))}
                                </div>
                                <button className="admin-pagination-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><span className="material-symbols-outlined fs-5">chevron_right</span></button>
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
                </div>
            </main>

            <style>{`
                .admin-pagination-btn { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #fff; border: none; border-radius: 16px; color: #64748b; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .admin-pagination-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); color: var(--admin-primary); }
                .admin-pagination-btn.active { background: var(--admin-primary); color: #fff; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
                .admin-pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .admin-btn-close-animate { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .admin-btn-close-animate:hover { transform: rotate(90deg); background-color: #fee2e2; border-radius: 8px; }
            `}</style>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowStatusModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: '450px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-semibold mb-0">Update Order Status</h4>
                            <button className="btn-close shadow-none admin-btn-close-animate" onClick={() => setShowStatusModal(false)}></button>
                        </div>
                        <div className="mb-4 p-3 bg-light rounded-4 border">
                            <div className="small fw-bold text-muted mb-1 text-uppercase">Current Status</div>
                            <div className="d-flex align-items-center gap-2">
                                <span className={`admin-badge ${getStatusClass(selectedOrder.order_status)}`}>{selectedOrder.order_status}</span>
                                <span className="text-muted fw-bold">→</span>
                                <span className="fw-semibold text-dark">Selection Below</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="small fw-bold text-muted mb-2 d-block text-uppercase">New Status <span className="text-danger">*</span></label>
                            <select className="form-select border-0 bg-light p-3 rounded-4 fw-semibold shadow-none" style={{ height: '60px' }} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="d-flex gap-3 mt-2">
                            <button className="btn btn-light flex-grow-1 p-3 rounded-4 fw-bold" onClick={() => setShowStatusModal(false)}>Cancel</button>
                            <button className="btn btn-success flex-grow-1 p-3 rounded-4 fw-bold" style={{ background: 'var(--admin-primary)', border: 'none' }} onClick={handleUpdateStatus}>Update Status</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowDetailsModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: '800px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <h3 className="fw-semibold mb-1">Order Details</h3>
                                <p className="text-muted fw-semibold small mb-0">Reviewing items and customer info.</p>
                            </div>
                            <button className="btn-close shadow-none admin-btn-close-animate" onClick={() => setShowDetailsModal(false)}></button>
                        </div>
                        {modalLoading || !selectedOrderDetails ? (
                            <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                        ) : (
                            <div className="animate-fade">
                                <div className="row g-4 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-4 bg-light rounded-4 h-100 border">
                                            <label className="small text-muted fw-semibold d-block mb-2 text-uppercase">Customer Info</label>
                                            <div className="fw-semibold text-dark mb-1 fs-5">{selectedOrderDetails.order.customer_name}</div>
                                            <div className="text-muted fw-bold small mb-2">{selectedOrderDetails.order.email}</div>
                                            <div className="small fw-semibold text-success mt-3 d-flex align-items-center gap-1">
                                                <span className="material-symbols-outlined fs-6">location_on</span>
                                                {selectedOrderDetails.order.delivery_address}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 bg-light rounded-4 h-100 border">
                                            <label className="small text-muted fw-semibold d-block mb-2 text-uppercase">Order Meta</label>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted fw-bold small">Number:</span>
                                                <span className="fw-semibold text-dark">{selectedOrderDetails.order.order_number}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted fw-bold small">Status:</span>
                                                <span className={`admin-badge ${getStatusClass(selectedOrderDetails.order.order_status)}`}>{selectedOrderDetails.order.order_status}</span>
                                            </div>
                                            {selectedOrderDetails.order.order_status === 'Cancelled' && selectedOrderDetails.order.cancelled_by && (
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted fw-bold small">Cancelled By:</span>
                                                    <span className="badge bg-danger p-1 px-2 rounded-3 small fw-bold">{selectedOrderDetails.order.cancelled_by}</span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted fw-bold small">Date:</span>
                                                <span className="fw-semibold text-dark">{new Date(selectedOrderDetails.order.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="small text-muted fw-semibold d-block mb-3 text-uppercase">Purchased Items</label>
                                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '300px' }}>
                                        {selectedOrderDetails.items.map((item, idx) => (
                                            <div key={idx} className="d-flex justify-content-between align-items-center p-3 bg-white border rounded-4 shadow-sm mx-1">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center fw-semibold text-success" style={{ width: 40, height: 40 }}>{idx + 1}</div>
                                                    <div>
                                                        <div className="fw-semibold text-dark small">{item.product_name}</div>
                                                        <div className="text-muted fw-bold small">Qty: {item.quantity} × Rs. {item.final_price || item.price}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-semibold text-dark">Rs. {(item.final_price || item.price) * item.quantity}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-20 d-flex justify-content-between align-items-center mt-auto shadow-sm">
                                    <span className="fw-semibold text-muted text-uppercase small">Total Amount Payable</span>
                                    <h3 className="fw-semibold mb-0 text-success" style={{ letterSpacing: '-0.02em' }}>Rs. {selectedOrderDetails.order.total_amount}</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
