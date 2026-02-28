import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || user?.role !== 'admin') {
            navigate('/login');
            return;
        }

        setAdmin(user);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const allOrders = [
        { id: '#ORD-9021', customer: 'Alex Johnson', date: 'Oct 24, 2023', total: '$120.50', status: 'Pending', statusColor: '#fb923c', statusBg: '#fff7ed' },
        { id: '#ORD-9022', customer: 'Maria Garcia', date: 'Oct 24, 2023', total: '$89.00', status: 'Processing', statusColor: '#3b82f6', statusBg: '#eff6ff' },
        { id: '#ORD-9023', customer: 'James Smith', date: 'Oct 23, 2023', total: '$210.00', status: 'Shipped', statusColor: '#10b981', statusBg: '#f0fdf4' },
        { id: '#ORD-9024', customer: 'Sarah Chen', date: 'Oct 23, 2023', total: '$45.25', status: 'Delivered', statusColor: '#64748b', statusBg: '#f8fafc' },
        { id: '#ORD-9025', customer: 'David Miller', date: 'Oct 22, 2023', total: '$178.00', status: 'Pending', statusColor: '#fb923c', statusBg: '#fff7ed' },
        { id: '#ORD-9026', customer: 'Emma Wilson', date: 'Oct 22, 2023', total: '$542.10', status: 'Processing', statusColor: '#3b82f6', statusBg: '#eff6ff' },
        { id: '#ORD-9027', customer: 'Michael Brown', date: 'Oct 21, 2023', total: '$150.00', status: 'Shipped', statusColor: '#10b981', statusBg: '#f0fdf4' },
        { id: '#ORD-9028', customer: 'Linda Taylor', date: 'Oct 21, 2023', total: '$65.00', status: 'Delivered', statusColor: '#64748b', statusBg: '#f8fafc' },
        { id: '#ORD-9029', customer: 'Robert White', date: 'Oct 20, 2023', total: '$320.40', status: 'Pending', statusColor: '#fb923c', statusBg: '#fff7ed' },
        { id: '#ORD-9030', customer: 'Steven Jobs', date: 'Oct 20, 2023', total: '$1200.00', status: 'Processing', statusColor: '#3b82f6', statusBg: '#eff6ff' },
        { id: '#ORD-9031', customer: 'Jennifer Law', date: 'Oct 19, 2023', total: '$95.00', status: 'Shipped', statusColor: '#10b981', statusBg: '#f0fdf4' },
        { id: '#ORD-9032', customer: 'Chris Evans', date: 'Oct 19, 2023', total: '$45.00', status: 'Delivered', statusColor: '#64748b', statusBg: '#f8fafc' },
        { id: '#ORD-9033', customer: 'Scarlett J', date: 'Oct 18, 2023', total: '$215.00', status: 'Pending', statusColor: '#fb923c', statusBg: '#fff7ed' },
        { id: '#ORD-9034', customer: 'Tom Holland', date: 'Oct 18, 2023', total: '$88.00', status: 'Processing', statusColor: '#3b82f6', statusBg: '#eff6ff' },
        { id: '#ORD-9035', customer: 'Zendaya M', date: 'Oct 17, 2023', total: '$340.00', status: 'Shipped', statusColor: '#10b981', statusBg: '#f0fdf4' },
    ];

    // Filter logic
    const filteredOrders = activeTab === 'all'
        ? allOrders
        : allOrders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

    // Count summaries for tabs
    const getCount = (status) => status === 'all'
        ? allOrders.length
        : allOrders.filter(order => order.status.toLowerCase() === status.toLowerCase()).length;

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page on filter change
    };

    return (
        <div className="admin-dashboard-wrapper bg-light vh-100 d-flex overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                :root {
                    --admin-primary: #10B981;
                    --admin-bg-light: #f8fafc;
                    --admin-sidebar-w: 260px;
                    --font-admin: 'Inter', sans-serif;
                }

                .admin-dashboard-wrapper {
                    font-family: var(--font-admin);
                    background-color: var(--admin-bg-light) !important;
                    height: 100vh;
                }

                .sidebar {
                    width: var(--admin-sidebar-w);
                    flex-shrink: 0;
                    background: #fff;
                    border-right: 1px solid rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    z-index: 100;
                }

                .nav-link-admin {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: 12px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin: 4px 16px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-link-admin:hover {
                    background: rgba(16, 185, 129, 0.04);
                    color: var(--admin-primary);
                }

                .nav-link-admin.active {
                    background: #f0fdf4;
                    color: var(--admin-primary);
                }


                .order-table th {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    background: #fff;
                    padding: 20px 32px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .order-table td {
                    padding: 24px 32px;
                    font-weight: 500;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.875rem;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-badge::before {
                    content: '';
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                }

                .order-tab {
                    padding: 12px 0;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                    border-bottom: 2px solid transparent;
                    background: none;
                    border-right: none;
                    border-left: none;
                    border-top: none;
                    margin-right: 32px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .order-tab.active {
                    color: var(--admin-primary);
                    border-bottom-color: var(--admin-primary);
                }

                .tab-count {
                    font-size: 10px;
                    padding: 2px 8px;
                    background: #f1f5f9;
                    border-radius: 100px;
                    color: #94a3b8;
                }

                .order-tab.active .tab-count {
                    background: #f0fdf4;
                    color: var(--admin-primary);
                }

                .pagination-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    color: #64748b;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .pagination-btn:hover:not(:disabled) {
                    border-color: var(--admin-primary);
                    color: var(--admin-primary);
                }

                .pagination-btn.active {
                    background: var(--admin-primary);
                    border-color: var(--admin-primary);
                    color: #fff;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .order-id-link {
                    color: var(--admin-primary);
                    text-decoration: none;
                    font-weight: 700;
                }

                .update-status-link {
                    color: var(--admin-primary);
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.8125rem;
                }
            `}</style>

            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="p-4 mb-3 d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: 'var(--admin-primary)', color: '#fff' }}>
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0f172a' }}>OGMS Admin</h6>
                        <small className="text-success fw-bold" style={{ fontSize: '11px', color: 'var(--admin-primary) !important' }}>SYSTEM CONSOLE</small>
                    </div>
                </div>

                <nav className="flex-grow-1">
                    <Link to="/admin/dashboard" className="nav-link-admin">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <a href="#" className="nav-link-admin">
                        <span className="material-symbols-outlined">package_2</span>
                        <span>Manage Products</span>
                    </a>
                    <Link to="/admin/orders" className="nav-link-admin active">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        <span>Orders</span>
                    </Link>
                    <a href="#" className="nav-link-admin">
                        <span className="material-symbols-outlined">bar_chart_4_bars</span>
                        <span>Reports</span>
                    </a>
                    <a href="#" className="nav-link-admin">
                        <span className="material-symbols-outlined">menu_book</span>
                        <span>Catalogues</span>
                    </a>
                    <a href="#" className="nav-link-admin">
                        <span className="material-symbols-outlined">group</span>
                        <span>Users</span>
                    </a>
                </nav>

                <div className="p-4 border-top mt-auto">
                    <div className="nav-link-admin m-0 px-2" role="button">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: '#f8fafc' }}>
                            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>settings</span>
                        </div>
                        <span className="fw-semibold">Settings</span>
                    </div>
                    <div className="nav-link-admin m-0 px-2 mt-2 text-danger" role="button" onClick={handleLogout}>
                        <span className="material-symbols-outlined">logout</span>
                        <span className="fw-semibold">Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow-1 overflow-auto d-flex flex-column h-100vh">
                <AdminHeader admin={admin} onLogout={handleLogout} />

                <div className="p-5 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '2.25rem', letterSpacing: '-0.04em' }}>Order Management</h2>
                            <p className="text-muted fw-semibold fs-6">Real-time tracking and processing of all customer orders.</p>
                        </div>
                        <div className="d-flex gap-3">
                            <button className="btn btn-white bg-white border px-4 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm" style={{ color: '#0f172a', borderColor: '#f1f5f9' }}>
                                <span className="material-symbols-outlined fs-5">upload</span>
                                Export
                            </button>
                            <button className="btn btn-success px-4 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm border-0" style={{ background: 'var(--admin-primary)' }}>
                                <span className="material-symbols-outlined fs-5">add</span>
                                New Order
                            </button>
                        </div>
                    </div>

                    <div className="order-tabs d-flex mb-4 border-bottom">
                        <button className={`order-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>
                            All Orders <span className="tab-count">{getCount('all')}</span>
                        </button>
                        <button className={`order-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => handleTabChange('pending')}>
                            Pending <span className="tab-count">{getCount('pending')}</span>
                        </button>
                        <button className={`order-tab ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => handleTabChange('processing')}>
                            Processing <span className="tab-count">{getCount('processing')}</span>
                        </button>
                        <button className={`order-tab ${activeTab === 'shipped' ? 'active' : ''}`} onClick={() => handleTabChange('shipped')}>
                            Shipped <span className="tab-count">{getCount('shipped')}</span>
                        </button>
                        <button className={`order-tab ${activeTab === 'delivered' ? 'active' : ''}`} onClick={() => handleTabChange('delivered')}>
                            Delivered <span className="tab-count">{getCount('delivered')}</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-5 shadow-sm overflow-hidden border" style={{ borderColor: '#f1f5f9' }}>
                        <div className="table-responsive">
                            <table className="table align-middle order-table mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-5">ORDER ID</th>
                                        <th>CUSTOMER NAME</th>
                                        <th>DATE</th>
                                        <th>TOTAL</th>
                                        <th>STATUS</th>
                                        <th className="text-end pe-5">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.map((order, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-5">
                                                <a href="#" className="order-id-link">{order.id}</a>
                                            </td>
                                            <td className="fw-semibold text-dark">{order.customer}</td>
                                            <td className="text-muted fw-semibold">{order.date}</td>
                                            <td className="fw-bold text-dark">{order.total}</td>
                                            <td>
                                                <span className="status-badge" style={{ color: order.statusColor, background: order.statusBg }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-5">
                                                <a href="#" className="update-status-link">Update Status</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted fw-semibold">
                                                No orders found for this status.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-4 d-flex align-items-center justify-content-between border-top">
                            <div className="small text-muted fw-semibold">
                                Showing {currentOrders.length > 0 ? indexOfFirstOrder + 1 : 0} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} entries
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined fs-6">chevron_left</span>
                                </button>

                                {Array.from({ length: Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage)) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage) || filteredOrders.length === 0}
                                >
                                    <span className="material-symbols-outlined fs-6">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="px-5 pb-5 text-center text-muted small mt-auto pt-5 border-top" style={{ borderColor: '#f1f5f9 !important' }}>
                    © 2024 OGMS - Online Grocery Management System. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default AdminOrders;
