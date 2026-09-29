import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
        totalProducts: 0,
        pendingOrders: 0,
    });
    const [salesPattern, setSalesPattern] = useState('7days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [salesTrend, setSalesTrend] = useState([]);
    const [inventoryHealth, setInventoryHealth] = useState({
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }

        setAdmin(user);

        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [summaryRes, ordersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/reports/dashboard-summary', config),
                    axios.get('http://localhost:5000/api/orders', config)
                ]);

                const { stats: dbStats, inventory: dbInventory } = summaryRes.data;

                setStats({
                    totalUsers: dbStats.total_users || 0,
                    totalOrders: dbStats.total_orders || 0,
                    totalSales: dbStats.total_revenue || 0,
                    totalProducts: dbStats.total_products || 0,
                    pendingOrders: dbStats.pending_orders || 0
                });

                const totalP = dbInventory.total_count || 1;
                setInventoryHealth({
                    inStock: Math.round((dbInventory.in_stock / totalP) * 100),
                    lowStock: Math.round((dbInventory.low_stock / totalP) * 100),
                    outOfStock: Math.round((dbInventory.out_of_stock / totalP) * 100)
                });

                setRecentOrders(ordersRes.data.data ? ordersRes.data.data.slice(0, 5) : []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchDashboardData();
    }, [navigate, token]);

    useEffect(() => {
        if (!token) return;
        const fetchSalesTrend = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                let url = `http://localhost:5000/api/reports/sales-trend?range=${salesPattern}`;
                if (salesPattern === 'custom' && customStartDate && customEndDate) {
                    url += `&start_date=${customStartDate}&end_date=${customEndDate}`;
                }
                const trendRes = await axios.get(url, config);
                setSalesTrend(trendRes.data || []);
            } catch (error) {
                console.error("Error fetching sales trend:", error);
            }
        };
        
        if (salesPattern !== 'custom' || (customStartDate && customEndDate)) {
            fetchSalesTrend();
        }
    }, [salesPattern, customStartDate, customEndDate, token]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return { bg: '#f0fdf4', color: '#16a34a' };
            case 'Shipped': return { bg: '#eff6ff', color: '#2563eb' };
            case 'Processing': return { bg: '#fff7ed', color: '#ea580c' };
            case 'Cancelled': return { bg: '#fef2f2', color: '#dc2626' };
            default: return { bg: '#f8fafc', color: '#64748b' };
        }
    };

    // Process Trend Data for Chart.js
    const processedTrendData = useMemo(() => {
        if (!salesTrend) return [];
        const now = new Date();
        let labels = [];
        let dataMap = {};

        salesTrend.forEach(item => {
            dataMap[item.date] = item.total_revenue;
        });

        if (salesPattern === '7days' || salesPattern === '30days') {
            const days = salesPattern === '7days' ? 7 : 30;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                labels.push(d.toISOString().split('T')[0]);
            }
        } else if (salesPattern === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(now.getFullYear(), now.getMonth(), i);
                labels.push(d.toISOString().split('T')[0]);
            }
        } else if (salesPattern === 'year') {
            for (let i = 0; i < 12; i++) {
                labels.push(`${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`);
            }
        } else if (salesPattern === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            let current = new Date(start);
            while (current <= end) {
                labels.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
                if (labels.length > 366) break;
            }
        }

        return labels.map(label => ({
            date: label,
            revenue: dataMap[label] || 0
        }));
    }, [salesTrend, salesPattern, customStartDate, customEndDate]);

    const chartData = {
        labels: processedTrendData.map(d => d.date),
        datasets: [{
            label: 'Revenue',
            data: processedTrendData.map(d => d.revenue),
            fill: true,
            borderColor: '#10b981',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: salesPattern === '7days' ? 4 : 1,
            borderWidth: 3
        }]
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
                    <div className="mb-5 animate-fade">
                        <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Dashboard Overview</h2>
                        <p className="text-muted fw-semibold">Real-time metrics and operational insights for your store.</p>
                    </div>

                    <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-4 mb-5">
                        <div className="col animate-fade" style={{ animationDelay: '0.1s' }}>
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc', color: '#64748b' }}>
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                    <span className="admin-badge admin-badge-success">Active</span>
                                </div>
                                <div className="stat-label uppercase small fw-bold text-muted">Total Users</div>
                                <div className="stat-value">{stats.totalUsers}</div>
                            </div>
                        </div>
                        <div className="col animate-fade" style={{ animationDelay: '0.2s' }}>
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                        <span className="material-symbols-outlined">shopping_basket</span>
                                    </div>
                                    <span className="admin-badge admin-badge-success">Total</span>
                                </div>
                                <div className="stat-label uppercase small fw-bold text-muted">Total Orders</div>
                                <div className="stat-value">{stats.totalOrders}</div>
                            </div>
                        </div>
                        <div className="col animate-fade" style={{ animationDelay: '0.3s' }}>
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ background: '#f0fdf4', color: '#10b981' }}>
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <span className="admin-badge admin-badge-success">Revenue</span>
                                </div>
                                <div className="stat-label uppercase small fw-bold text-muted">Total Sales</div>
                                <div className="stat-value">Rs. {Number(stats.totalSales).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="col animate-fade" style={{ animationDelay: '0.4s' }}>
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ background: '#faf5ff', color: '#a855f7' }}>
                                        <span className="material-symbols-outlined">inventory</span>
                                    </div>
                                    <span className="admin-badge admin-badge-success">Catalog</span>
                                </div>
                                <div className="stat-label uppercase small fw-bold text-muted">Total Products</div>
                                <div className="stat-value">{stats.totalProducts}</div>
                            </div>
                        </div>
                        <div className="col animate-fade" style={{ animationDelay: '0.5s' }}>
                            <div className="stat-card">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ background: '#fff7ed', color: '#fb923c' }}>
                                        <span className="material-symbols-outlined">pending_actions</span>
                                    </div>
                                    <span className="admin-badge admin-badge-danger">Urgent</span>
                                </div>
                                <div className="stat-label uppercase small fw-bold text-muted">Pending Orders</div>
                                <div className="stat-value">{stats.pendingOrders}</div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mb-5">
                        <div className="col-lg-8 animate-fade" style={{ animationDelay: '0.6s' }}>
                            <div className="stat-card h-100 border-0 shadow-sm" style={{ padding: '2.5rem' }}>
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <div>
                                        <h4 className="fw-semibold text-dark mb-1" style={{ fontSize: '1.5rem' }}>Sales Trends</h4>
                                        <p className="text-muted small fw-bold">
                                            Revenue growth over the {
                                                salesPattern === '7days' ? 'last 7 days' :
                                                salesPattern === '30days' ? 'last 30 days' :
                                                salesPattern === 'month' ? 'current month' :
                                                salesPattern === 'year' ? 'current year' :
                                                salesPattern === 'custom' ? `period ${customStartDate} to ${customEndDate}` : 'selected period'
                                            }
                                        </p>
                                    </div>
                                    <div className="d-flex gap-3 align-items-center">
                                        {salesPattern === 'custom' && (
                                            <div className="d-flex gap-2 animate-fade">
                                                <input 
                                                    type="date" 
                                                    className="form-control form-control-sm border-0 shadow-sm rounded-4 px-3"
                                                    style={{ height: '42px', width: '140px', fontSize: '12px' }}
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                />
                                                <input 
                                                    type="date" 
                                                    className="form-control form-control-sm border-0 shadow-sm rounded-4 px-3"
                                                    style={{ height: '42px', width: '140px', fontSize: '12px' }}
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="position-relative">
                                            <select 
                                                className="form-select form-select-sm border-0 shadow-sm rounded-4 px-3 fw-bold"
                                                style={{ height: '42px', width: '160px', fontSize: '12px', backgroundColor: '#ecfdf5', color: '#10b981', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'none' }}
                                                value={salesPattern}
                                                onChange={(e) => setSalesPattern(e.target.value)}
                                            >
                                                <option value="7days">Last 7 Days</option>
                                                <option value="30days">Last 30 Days</option>
                                                <option value="month">Current Month</option>
                                                <option value="year">Current Year</option>
                                                <option value="custom">Custom Range</option>
                                            </select>
                                            <span className="material-symbols-outlined position-absolute" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', pointerEvents: 'none', fontSize: '20px' }}>expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="position-relative flex-grow-1" style={{ minHeight: 300 }}>
                                    <Line 
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#1f2937',
                                                    padding: 12,
                                                    displayColors: false,
                                                    callbacks: {
                                                        label: (context) => `Revenue: Rs. ${context.parsed.y.toLocaleString()}`
                                                    }
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                                                    ticks: {
                                                        font: { weight: 'bold', size: 10 },
                                                        callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
                                                    }
                                                },
                                                x: {
                                                    grid: { display: false },
                                                    ticks: {
                                                        font: { weight: 'bold', size: 10 },
                                                        maxRotation: 0,
                                                        autoSkip: true,
                                                        maxTicksLimit: salesPattern === '30days' ? 10 : 7
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 animate-fade" style={{ animationDelay: '0.7s' }}>
                            <div className="stat-card h-100 border-0 shadow-sm d-flex flex-column" style={{ padding: '2.5rem' }}>
                                <h4 className="fw-semibold text-dark mb-5" style={{ fontSize: '1.5rem' }}>Inventory Health</h4>
                                <div className="flex-grow-1 d-flex flex-column justify-content-center gap-5">
                                    {[
                                        { label: 'In Stock', value: inventoryHealth.inStock, color: '#10b981' },
                                        { label: 'Low Stock', value: inventoryHealth.lowStock, color: '#f59e0b' },
                                        { label: 'Out of Stock', value: inventoryHealth.outOfStock, color: '#ef4444' }
                                    ].map((item, idx) => (
                                        <div key={idx}>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="fw-semibold text-dark small text-uppercase">{item.label}</span>
                                                <span className="fw-semibold" style={{ color: item.color }}>{item.value}%</span>
                                            </div>
                                            <div className="progress" style={{ height: 10, borderRadius: 20, background: '#f1f5f9' }}>
                                                <div className="progress-bar transition-all" style={{ width: `${item.value}%`, background: item.color, borderRadius: 20 }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/admin/products" className="btn w-100 py-3 rounded-4 mt-5 fw-semibold border-2 transition-all d-flex align-items-center justify-content-center gap-2" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', background: '#f0fdf4' }}>
                                    Review Products
                                    <span className="material-symbols-outlined fs-5">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-5 shadow-sm overflow-hidden border-0">
                        <div className="px-5 py-5 d-flex align-items-center justify-content-between bg-light bg-opacity-50">
                            <div>
                                <h4 className="fw-semibold text-dark mb-1" style={{ fontSize: '1.25rem' }}>Recent Orders</h4>
                                <p className="text-muted small fw-bold mb-0">Latest transaction activities</p>
                            </div>
                            <Link to="/admin/orders" className="btn btn-white border shadow-sm px-4 py-2 rounded-4 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '14px', color: '#64748b' }}>
                                View All
                                <span className="material-symbols-outlined fs-5">open_in_new</span>
                            </Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle admin-table mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-5">ORDER REF</th>
                                        <th>DATE</th>
                                        <th>CUSTOMER</th>
                                        <th>STATUS</th>
                                        <th className="text-end pe-5">TOTAL AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map((order) => {
                                        const style = getStatusStyle(order.order_status);
                                        return (
                                            <tr key={order.order_id}>
                                                <td className="ps-5 fw-semibold text-success">#ORD-{order.order_number || order.order_id}</td>
                                                <td className="text-muted fw-bold small">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{order.customer_name || 'Anonymous'}</div>
                                                    <div className="text-muted small fw-bold" style={{ fontSize: '11px' }}>{order.email}</div>
                                                </td>
                                                <td>
                                                    <span className="badge px-3 py-2 rounded-pill fw-semibold" style={{ background: style.bg, color: style.color, fontSize: '11px' }}>{order.order_status}</span>
                                                </td>
                                                <td className="text-end pe-5 fw-semibold text-dark">Rs. {Number(order.total_amount).toLocaleString()}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">No recent activities found.</td></tr>
                                    )}
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
