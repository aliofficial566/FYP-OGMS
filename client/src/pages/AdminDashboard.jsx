import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }

        setAdmin(user);

        // Show welcome toast only on first login
        if (sessionStorage.getItem('isFirstLogin') === 'true') {
            setToast({
                type: 'success',
                title: 'Admin Access',
                message: `Welcome to the Admin Panel, ${user.name}!`
            });
            sessionStorage.removeItem('isFirstLogin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
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

                .admin-header {
                    height: 72px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 0 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 90;
                }


                .dashboard-title {
                    font-size: 2.25rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    color: #0f172a;
                }

                .stat-card {
                    background: #fff;
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    color: #0f172a;
                    margin-top: 8px;
                }

                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #64748b;
                }

                .trend-card, .health-card {
                    background: #fff;
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }

                .admin-table th {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    background: #f8fafc;
                    padding: 20px 32px;
                    border: none;
                }

                .admin-table td {
                    padding: 20px 32px;
                    font-weight: 500;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                }

                .badge-pill-custom {
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                }
            `}</style>

            {/* Notification Toast */}
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
                    <Link to="/admin/dashboard" className="nav-link-admin active">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <a href="#" className="nav-link-admin">
                        <span className="material-symbols-outlined">package_2</span>
                        <span>Manage Products</span>
                    </a>
                    <Link to="/admin/orders" className="nav-link-admin">
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
            <main className="flex-grow-1 overflow-auto">
                <AdminHeader admin={admin} onLogout={handleLogout} />

                <div className="p-5">
                    <div className="mb-5">
                        <h2 className="dashboard-title mb-1">Dashboard Overview</h2>
                        <p className="text-muted fw-semibold fs-6">Welcome back, check your store's latest activity.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-4 mb-5">
                        <div className="col">
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="p-3 rounded-4" style={{ background: '#f8fafc', color: '#64748b' }}>
                                        <span className="material-symbols-outlined d-block fs-4">group</span>
                                    </div>
                                    <span className="badge-pill-custom" style={{ background: '#f0fdf4', color: '#10b981' }}>+4.2%</span>
                                </div>
                                <h3 className="stat-value">2,850</h3>
                                <p className="stat-label mb-0">Total Users</p>
                            </div>
                        </div>
                        <div className="col">
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="p-3 rounded-4" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                        <span className="material-symbols-outlined d-block fs-4">shopping_basket</span>
                                    </div>
                                    <span className="badge-pill-custom" style={{ background: '#f0fdf4', color: '#10b981' }}>+12.5%</span>
                                </div>
                                <h3 className="stat-value">1,284</h3>
                                <p className="stat-label mb-0">Total Orders</p>
                            </div>
                        </div>
                        <div className="col">
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="p-3 rounded-4" style={{ background: '#f0fdf4', color: '#10b981' }}>
                                        <span className="material-symbols-outlined d-block fs-4">payments</span>
                                    </div>
                                    <span className="badge-pill-custom" style={{ background: '#f0fdf4', color: '#10b981' }}>+8.2%</span>
                                </div>
                                <h3 className="stat-value">$45,230.00</h3>
                                <p className="stat-label mb-0">Total Sales</p>
                            </div>
                        </div>
                        <div className="col">
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="p-3 rounded-4" style={{ background: '#faf5ff', color: '#a855f7' }}>
                                        <span className="material-symbols-outlined d-block fs-4">inventory</span>
                                    </div>
                                    <span className="badge-pill-custom" style={{ background: '#f0fdf4', color: '#10b981' }}>+3.1%</span>
                                </div>
                                <h3 className="stat-value">3,420</h3>
                                <p className="stat-label mb-0">Total Products</p>
                            </div>
                        </div>
                        <div className="col">
                            <div className="stat-card" style={{ borderLeft: '4px solid #fb923c' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="p-3 rounded-4" style={{ background: '#fff7ed', color: '#fb923c' }}>
                                        <span className="material-symbols-outlined d-block fs-4">pending_actions</span>
                                    </div>
                                    <span className="badge-pill-custom" style={{ background: '#fff7ed', color: '#fb923c' }}>8 New</span>
                                </div>
                                <h3 className="stat-value" style={{ color: '#fb923c' }}>42</h3>
                                <p className="stat-label mb-0" style={{ color: '#fb923c' }}>Pending Orders</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-8">
                            <div className="trend-card">
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>Sales Trends</h4>
                                        <p className="text-muted small fw-semibold mb-0">Revenue growth over the last 7 days</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-success btn-sm px-4 fw-bold rounded-3" style={{ background: 'var(--admin-primary)', border: 'none', fontSize: 13, height: 36 }}>Weekly</button>
                                        <button className="btn btn-light btn-sm px-4 fw-bold rounded-3 border-0" style={{ fontSize: 13, height: 36, color: '#64748b' }}>Monthly</button>
                                    </div>
                                </div>
                                <div className="position-relative mt-2" style={{ height: 260 }}>
                                    <svg className="w-100 h-100" preserveAspectRatio="none" viewBox="0 0 500 200">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,180 C50,160 80,190 120,130 C160,70 200,100 250,60 C300,20 350,80 400,40 C450,0 480,30 500,20 L500,200 L0,200 Z" fill="url(#chartGradient)" />
                                        <path d="M0,180 C50,160 80,190 120,130 C160,70 200,100 250,60 C300,20 350,80 400,40 C450,0 480,30 500,20" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="4" />
                                    </svg>
                                    <div className="d-flex justify-content-between border-top pt-4 mt-2 px-2">
                                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                            <span key={day} className="text-muted fw-bold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>{day}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="health-card d-flex flex-column">
                                <h4 className="fw-bold text-dark mb-4" style={{ fontSize: '1.25rem' }}>Inventory Health</h4>
                                <div className="flex-grow-1 d-flex flex-column justify-content-center gap-5">
                                    <div>
                                        <div className="d-flex justify-content-between mb-3 small fw-bold">
                                            <span className="text-dark">In Stock</span>
                                            <span className="text-success" style={{ color: 'var(--admin-primary)' }}>85%</span>
                                        </div>
                                        <div className="progress" style={{ height: 10, borderRadius: 10, background: '#f1f5f9' }}>
                                            <div className="progress-bar" style={{ width: '85%', background: 'var(--admin-primary)', borderRadius: 10 }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between mb-3 small fw-bold">
                                            <span className="text-dark">Low Stock</span>
                                            <span style={{ color: '#fb923c' }}>12%</span>
                                        </div>
                                        <div className="progress" style={{ height: 10, borderRadius: 10, background: '#f1f5f9' }}>
                                            <div className="progress-bar" style={{ width: '12%', background: '#fb923c', borderRadius: 10 }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between mb-3 small fw-bold">
                                            <span className="text-dark">Out of Stock</span>
                                            <span className="text-danger">3%</span>
                                        </div>
                                        <div className="progress" style={{ height: 10, borderRadius: 10, background: '#f1f5f9' }}>
                                            <div className="progress-bar bg-danger" style={{ width: '3%', borderRadius: 10 }}></div>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-success w-100 py-3 rounded-3 mt-5 fw-bold border-2" style={{ borderColor: 'var(--admin-primary)', color: 'var(--admin-primary)' }}>
                                    Review Catalogues
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-5 shadow-sm overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
                        <div className="px-5 py-5 d-flex align-items-center justify-content-between">
                            <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>Recent Orders</h4>
                            <button className="btn text-success fw-bold p-0 fs-6 hover-underline" style={{ color: 'var(--admin-primary)' }}>View All</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle admin-table mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-5">ORDER ID</th>
                                        <th>PRODUCT</th>
                                        <th>CUSTOMER</th>
                                        <th>STATUS</th>
                                        <th className="text-end pe-5">AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: '#ORD-4921', product: 'Wireless Earbuds Pro', customer: 'Alex Thompson', status: 'Delivered', amount: '$129.99', bg: '#dcfce7', color: '#15803d' },
                                        { id: '#ORD-4922', product: 'Smart Watch Series 7', customer: 'Sarah Jenkins', status: 'Processing', amount: '$399.00', bg: '#dbeafe', color: '#1d4ed8' },
                                        { id: '#ORD-4923', product: 'Leather Laptop Sleeve', customer: 'Michael Ross', status: 'Pending', amount: '$45.50', bg: '#ffedd5', color: '#c2410c' }
                                    ].map((order, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-5 fw-bold text-dark">{order.id}</td>
                                            <td>{order.product}</td>
                                            <td className="fw-semibold text-secondary">{order.customer}</td>
                                            <td>
                                                <span className="badge-pill-custom" style={{ background: order.bg, color: order.color }}>{order.status}</span>
                                            </td>
                                            <td className="text-end pe-5 fw-bold text-dark">{order.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
