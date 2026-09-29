import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Branding';
import axios from 'axios';

const Navbar = ({ cartCount: propCartCount, onLogout: propOnLogout, user: propUser, navigate: propNavigate, onOpenAuth, searchQuery: externalSearchQuery, setSearchQuery: setExternalSearchQuery, onOpenProfile, hideSearch = false, filters, onApplyFilters, onResetFilters }) => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(propUser || null);
    const [cartCount, setCartCount] = React.useState(propCartCount || 0);
    const [localSearchQuery, setLocalSearchQuery] = React.useState(externalSearchQuery || '');
    const [minPrice, setMinPrice] = React.useState(filters?.minPrice || '');
    const [maxPrice, setMaxPrice] = React.useState(filters?.maxPrice || '');
    const [inStock, setInStock] = React.useState(filters?.inStock || false);
    const [sortBy, setSortBy] = React.useState(filters?.sortBy || 'featured');
    const [brand, setBrand] = React.useState(filters?.brand || '');
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleNotificationClick = async (notif) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            // Mark as read
            await axios.put(`http://localhost:5000/api/notifications/${notif.notification_id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(notifications.map(n => 
                n.notification_id === notif.notification_id ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            // Navigate to orders page if it's an order notification
            if (notif.type === 'order_status') {
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getStatusInfo = (message) => {
        if (message.includes('Pending')) return { status: 'Pending', color: '#f59e0b', bg: '#fef3c7' };
        if (message.includes('Processing')) return { status: 'Processing', color: '#3b82f6', bg: '#eff6ff' };
        if (message.includes('Shipped')) return { status: 'Shipped', color: '#8b5cf6', bg: '#f5f3ff' };
        if (message.includes('Delivered')) return { status: 'Delivered', color: '#10b981', bg: '#ecfdf5' };
        if (message.includes('Cancelled')) return { status: 'Cancelled', color: '#ef4444', bg: '#fef2f2' };
        return { status: null, color: '#6b7280', bg: '#f3f4f6' };
    };

    React.useEffect(() => {
        if (propUser) setUser(propUser);
    }, [propUser]);

    React.useEffect(() => {
        if (propCartCount !== undefined) setCartCount(propCartCount);
    }, [propCartCount]);

    React.useEffect(() => {
        setLocalSearchQuery(externalSearchQuery || '');
    }, [externalSearchQuery]);

    React.useEffect(() => {
        const updateCart = () => {
            try {
                const savedCart = localStorage.getItem('cart');
                const cart = savedCart ? JSON.parse(savedCart) : [];
                if (Array.isArray(cart)) {
                    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
                } else {
                    setCartCount(0);
                }
            } catch (e) {
                console.error("Error parsing cart in Navbar", e);
                setCartCount(0);
            }
        };
        
        const updateUser = () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Error parsing user in Navbar", e);
                setUser(null);
            }
        };

        if (!propUser) updateUser();
        if (propCartCount === undefined) updateCart();

        window.addEventListener('cartUpdated', updateCart);
        window.addEventListener('userUpdated', updateUser);
        return () => {
            window.removeEventListener('cartUpdated', updateCart);
            window.removeEventListener('userUpdated', updateUser);
        };
    }, [propUser, propCartCount]);

    const handleLogout = () => {
        if (propOnLogout) {
            propOnLogout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
            window.dispatchEvent(new Event('userUpdated'));
        }
    };

    React.useEffect(() => {
        if (filters) {
            setMinPrice(filters.minPrice);
            setMaxPrice(filters.maxPrice);
            setInStock(filters.inStock);
            setSortBy(filters.sortBy || 'featured');
            setBrand(filters.brand || '');
        }
    }, [filters]);

    const handleApply = () => {
        if (onApplyFilters) {
            onApplyFilters({ minPrice, maxPrice, inStock, sortBy, brand });
        }
    };

    const handleReset = () => {
        if (onResetFilters) {
            onResetFilters();
        }
    };

    const hasActiveFilters = filters && (filters.minPrice !== '' || filters.maxPrice !== '' || filters.inStock || filters.brand);

    return (
    <>
        {/* Top Bar with Quick Links */}
        <div className="bg-light border-bottom py-1 d-none d-lg-block" style={{ fontSize: '12px' }}>
            <div className="mx-auto d-flex justify-content-end align-items-center" style={{ width: '75%' }}>
                <div className="d-flex gap-4">
                    <a href="#" onClick={(e) => { 
                        e.preventDefault(); 
                        if (!user) {
                            if (onOpenAuth) onOpenAuth('login', 'Please login first');
                        } else {
                            if (onOpenProfile) onOpenProfile();
                        }
                    }} className="text-muted text-decoration-none fw-medium transition-all hover-text-success">My Account</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/categories'); }} className="text-muted text-decoration-none fw-medium transition-all hover-text-success">Categories</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact-us'); }} className="text-muted text-decoration-none fw-medium transition-all hover-text-success">Contact Us</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/about-us'); }} className="text-muted text-decoration-none fw-medium transition-all hover-text-success">About Us</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/faqs'); }} className="text-muted text-decoration-none fw-medium transition-all hover-text-success">FAQs</a>
                </div>
            </div>
        </div>

        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
            <div className="mx-auto d-flex align-items-center" style={{ width: '75%' }}>
                <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <Logo size="md" />
                </a>

                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#dashboardNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="dashboardNavbar">
                    {!hideSearch ? (
                        <div className="mx-lg-auto my-3 my-lg-0 w-100 px-lg-4 d-flex flex-column gap-2" style={{ maxWidth: '650px' }}>
                            <div className="d-flex align-items-center gap-2 w-100">
                                <div className="input-group bg-light rounded-pill overflow-hidden border-0 flex-grow-1 transition-all focus-within-shadow" style={{ border: '1px solid #f1f5f9' }}>
                                    <span className="input-group-text bg-transparent border-0 ps-3 pe-2 text-muted">
                                        <span className="material-symbols-outlined">search</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-transparent border-0 py-2 ps-2 shadow-none" 
                                        placeholder="Search for groceries..." 
                                        value={localSearchQuery}
                                        onChange={(e) => {
                                            setLocalSearchQuery(e.target.value);
                                            if (setExternalSearchQuery) setExternalSearchQuery(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !setExternalSearchQuery) {
                                                navigate(`/?search=${encodeURIComponent(localSearchQuery)}`);
                                            }
                                        }}
                                        style={{ fontSize: '0.95rem' }}
                                    />
                                </div>
                                {onApplyFilters && (
                                    <div className="dropdown">
                                        <button 
                                            className="btn btn-light rounded-pill border-0 d-flex align-items-center gap-2 px-3 py-2 text-muted shadow-sm hover-bg-light dropdown-toggle hide-caret transition-all" 
                                            type="button" 
                                            data-bs-toggle="dropdown" 
                                            data-bs-auto-close="outside"
                                        >
                                            <span className="material-symbols-outlined fs-5">tune</span>
                                            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Filter</span>
                                        </button>
                                        <div className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-3 rounded-4 mt-2" style={{ width: '320px', zIndex: 1050 }}>
                                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                <span className="material-symbols-outlined">tune</span>
                                                Filter Products
                                            </h6>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted mb-1">Price Range (Rs.)</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <input type="number" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                                                    <span className="text-muted">-</span>
                                                    <input type="number" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted mb-1">Brand</label>
                                                <input type="text" className="form-control form-control-sm" placeholder="Enter brand name" value={brand} onChange={e => setBrand(e.target.value)} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted mb-1">Sort By</label>
                                                <select className="form-select form-select-sm rounded-3" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                                    <option value="featured">Featured</option>
                                                    <option value="price_asc">Price: Low to High</option>
                                                    <option value="price_desc">Price: High to Low</option>
                                                    <option value="newest">Newest Arrivals</option>
                                                    <option value="name_asc">Name: A-Z</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="navInStockCheck" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                                                    <label className="form-check-label small fw-bold" htmlFor="navInStockCheck">
                                                        In Stock Only
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="d-grid">
                                                <button className="btn btn-success fw-bold py-2 rounded-pill shadow-sm" onClick={handleApply}>Apply Filters</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="d-flex align-items-center flex-wrap gap-2 w-100">
                                    <span className="text-muted small fw-bold me-1">Applied Filters:</span>
                                    {(filters?.minPrice || filters?.maxPrice) && (
                                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-flex align-items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
                                            Rs. {filters?.minPrice || '0'} - {filters?.maxPrice || 'Max'}
                                        </span>
                                    )}
                                    {filters?.inStock && (
                                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-flex align-items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined text-success" style={{ fontSize: '14px' }}>check_circle</span>
                                            In Stock Only
                                        </span>
                                    )}
                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 ms-auto d-flex align-items-center gap-1 fw-bold border-0 hover-bg-light text-danger" onClick={handleReset}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mx-lg-auto"></div>
                    )}

                    <div className="navbar-nav gap-3 align-items-center">
                        <button 
                            className="btn d-flex align-items-center justify-content-center rounded-circle border-0 shadow-none cart-btn-modern transition-all" 
                            onClick={() => navigate('/cart')} 
                            style={{ 
                                width: '48px', 
                                height: '48px', 
                                backgroundColor: '#f0fdf4',
                                position: 'relative'
                            }}
                        >
                            <span className="material-symbols-outlined fs-4 text-success fw-bold">shopping_cart</span>
                            {cartCount > 0 && (
                                <span 
                                    className="position-absolute badge rounded-circle bg-success d-flex align-items-center justify-content-center text-white border border-2 border-white shadow-sm animate__animated animate__bounceIn" 
                                    style={{ 
                                        top: '-2px', 
                                        right: '-2px', 
                                        width: '22px', 
                                        height: '22px', 
                                        fontSize: '11px', 
                                        padding: 0,
                                        fontWeight: '800'
                                    }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="d-flex align-items-center gap-3">
                                {/* Notification Bell */}
                                <div className="dropdown">
                                    <button className="btn btn-light rounded-pill border-0 d-flex align-items-center justify-content-center p-0 position-relative" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ width: '40px', height: '40px' }}>
                                        <span className="material-symbols-outlined text-secondary">notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="position-absolute badge rounded-circle bg-danger d-flex align-items-center justify-content-center text-white border border-2 border-white" style={{ top: '-2px', right: '-2px', width: '20px', height: '20px', fontSize: '10px', padding: 0, fontWeight: 'bold' }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-3 mt-2" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 1100 }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0">Notifications</h6>
                                            {unreadCount > 0 && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill fw-bold" style={{ fontSize: '11px' }}>{unreadCount} Unread</span>}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-3 text-muted fw-semibold">No notifications yet.</div>
                                        ) : (
                                            notifications.map(notif => {
                                                const statusInfo = getStatusInfo(notif.message);
                                                return (
                                                    <li key={notif.notification_id} className={`p-2 rounded-3 mb-2 transition-all cursor-pointer ${notif.is_read ? 'bg-light' : 'bg-success bg-opacity-10'}`} onClick={() => handleNotificationClick(notif)}>
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-bold text-dark small">{notif.title}</span>
                                                                {statusInfo.status && (
                                                                    <span className="badge rounded-pill" style={{ color: statusInfo.color, backgroundColor: statusInfo.bg, fontSize: '10px', fontWeight: '700' }}>
                                                                        {statusInfo.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-secondary small">{notif.message}</span>
                                                            <small className="text-muted mt-1" style={{ fontSize: '10px' }}>{new Date(notif.created_at).toLocaleString()}</small>
                                                        </div>
                                                    </li>
                                                );
                                            })
                                        )}
                                    </ul>
                                </div>

                                {/* Profile Dropdown */}
                                <div className="dropdown">
                                    <button className="btn d-flex align-items-center gap-2 px-1 text-dark fw-medium border-0 shadow-none dropdown-toggle hide-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <div className="d-flex align-items-center gap-2 bg-light rounded-pill p-1 pe-3 hover-lift transition-all">
                                            {user.profile_image ? (
                                                <div className="rounded-circle overflow-hidden shadow-sm border border-2 border-white" style={{ width: '36px', height: '36px' }}>
                                                    <img src={`http://localhost:5000${user.profile_image}`} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px' }}>
                                                    <span className="material-symbols-outlined text-secondary fs-5">person</span>
                                                </div>
                                            )}
                                            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{user?.name || 'User'}</span>
                                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>expand_more</span>
                                        </div>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2" style={{ minWidth: '240px' }}>
                                        <li>
                                            <div className="px-3 py-3 d-flex align-items-center gap-3">
                                                {user.profile_image ? (
                                                    <div className="rounded-circle overflow-hidden shadow-sm" style={{ width: '50px', height: '50px' }}>
                                                        <img src={`http://localhost:5000${user.profile_image}`} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                        <span className="material-symbols-outlined display-6 text-muted">person</span>
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <div className="fw-black text-dark text-truncate" style={{ fontSize: '1.05rem' }}>{user.name}</div>
                                                    <div className="text-secondary small text-truncate">{user.email}</div>
                                                </div>
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider opacity-50 mx-2" /></li>
                                        {user.role === 'admin' && (
                                            <li>
                                                <a className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 transition-all hover-bg-light" href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}>
                                                    <span className="material-symbols-outlined fs-5 text-secondary">dashboard</span>
                                                    <span className="fw-semibold">Admin Dashboard</span>
                                                </a>
                                            </li>
                                        )}
                                        <li>
                                            <a className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 transition-all hover-bg-light" href="#" onClick={(e) => { e.preventDefault(); navigate('/my-orders'); }}>
                                                <span className="material-symbols-outlined fs-5 text-secondary">shopping_bag</span>
                                                <span className="fw-semibold">My Orders</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 transition-all hover-bg-light" href="#" onClick={(e) => { e.preventDefault(); if (onOpenProfile) onOpenProfile(); }}>
                                                <span className="material-symbols-outlined fs-5 text-secondary">edit_square</span>
                                                <span className="fw-semibold">Edit Profile</span>
                                            </a>
                                        </li>
                                        <li><hr className="dropdown-divider opacity-50 mx-2" /></li>
                                        <li>
                                            <button className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 text-danger fw-bold transition-all hover-bg-danger-light" onClick={handleLogout}>
                                                <span className="material-symbols-outlined fs-5">logout</span>
                                                <span>Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex gap-2 ms-lg-2">
                                <button
                                    className="btn btn-outline-success rounded-pill px-4 fw-bold btn-sm transition-all"
                                    onClick={() => onOpenAuth('login')}
                                >
                                    Sign In
                                </button>
                                <button
                                    className="btn btn-success rounded-pill px-4 fw-bold btn-sm shadow-sm transition-all hover-lift"
                                    onClick={() => onOpenAuth('signup')}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .cart-btn-modern:hover {
                    background-color: #dcfce7 !important;
                    transform: scale(1.05);
                }
                .cart-btn-modern:active {
                    transform: scale(0.95);
                }
                .hover-bg-danger-light:hover {
                    background-color: #fef2f2 !important;
                    color: #dc2626 !important;
                }
                .focus-within-shadow:focus-within {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
                    background-color: white !important;
                }
                .hide-caret::after {
                    display: none !important;
                }
            `}</style>
        </nav>
    </>
    );
};

export default Navbar;
