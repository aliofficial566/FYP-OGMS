import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import '../styles/admin.css';


const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setAdmin(user);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleProfileUpdate = (updatedUser) => {
        setAdmin(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isActive = (path) => {
        return location.pathname.includes(path) ? 'active' : '';
    };

    return (
        <aside className={`sidebar ${isMinimized ? 'minimized' : ''}`} style={{ width: isMinimized ? '80px' : 'var(--admin-sidebar-w)' }}>
            <div className="collapse-toggle" onClick={() => setIsMinimized(!isMinimized)}>
                <span className="material-symbols-outlined">chevron_left</span>
            </div>
            <div className={`mb-3 d-flex align-items-center ${isMinimized ? 'justify-content-center px-0' : 'justify-content-between p-4'}`} style={{ height: '88px' }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ minWidth: 40, width: 40, height: 40, background: 'var(--admin-primary)', color: '#fff' }}>
                        <span className="material-symbols-outlined fs-5">inventory_2</span>
                    </div>
                    {!isMinimized && (
                        <div className="animate-fade" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <h6 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0f172a' }}>OGMS Admin</h6>
                            <small className="text-success fw-bold" style={{ fontSize: '11px' }}>SYSTEM CONSOLE</small>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-grow-1 overflow-y-auto overflow-x-hidden">
                <Link to="/admin/dashboard" className={`nav-link-admin ${isActive('/admin/dashboard')}`} title="Dashboard">
                    <span className="material-symbols-outlined">dashboard</span>
                    {!isMinimized && <span>Dashboard</span>}
                </Link>
                <Link to="/admin/catalogues" className={`nav-link-admin ${isActive('/admin/catalogues')}`} title="Manage Catalogues">
                    <span className="material-symbols-outlined">menu_book</span>
                    {!isMinimized && <span>Manage Catalogues</span>}
                </Link>
                <Link to="/admin/categories" className={`nav-link-admin ${isActive('/admin/categories')}`} title="Manage Categories">
                    <span className="material-symbols-outlined">category</span>
                    {!isMinimized && <span>Manage Categories</span>}
                </Link>
                <Link to="/admin/products" className={`nav-link-admin ${isActive('/admin/products')}`} title="Manage Products">
                    <span className="material-symbols-outlined">package_2</span>
                    {!isMinimized && <span>Manage Products</span>}
                </Link>
                <Link to="/admin/orders" className={`nav-link-admin ${isActive('/admin/orders')}`} title="Manage Orders">
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {!isMinimized && <span>Manage Orders</span>}
                </Link>
                <Link to="/admin/reports" className={`nav-link-admin ${isActive('/admin/reports')}`} title="Reports">
                    <span className="material-symbols-outlined">bar_chart_4_bars</span>
                    {!isMinimized && <span>Reports</span>}
                </Link>
                <Link to="/admin/users" className={`nav-link-admin ${isActive('/admin/users')}`} title="Users">
                    <span className="material-symbols-outlined">group</span>
                    {!isMinimized && <span>Users</span>}
                </Link>
            </nav>

            <div className="mt-auto border-top p-3">
                <div className="dropdown w-100">
                    <button 
                        className="btn w-100 d-flex align-items-center gap-3 border-0 bg-light rounded-3 p-2 text-start"
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        <div className="rounded-circle overflow-hidden flex-shrink-0" style={{ width: 36, height: 36 }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin?.name || 'Admin')}&background=10b981&color=fff&bold=true`}
                                className="w-100 h-100 object-fit-cover"
                                alt="Avatar"
                            />
                        </div>
                        {!isMinimized && (
                            <div className="flex-grow-1 overflow-hidden">
                                <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '0.875rem' }}>{admin?.name || 'Admin User'}</p>
                                <p className="mb-0 text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>Head of Operations</p>
                            </div>
                        )}
                        {!isMinimized && <span className="material-symbols-outlined text-muted ms-auto">expand_more</span>}
                    </button>
                    <ul className="dropdown-menu shadow-lg border-0 rounded-4 p-2" style={{ minWidth: isMinimized ? '200px' : '100%', marginBottom: '8px' }}>
                        <li>
                            <button className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-3" onClick={() => setIsProfileOpen(true)}>
                                <span className="material-symbols-outlined fs-5 text-secondary">manage_accounts</span>
                                <span className="fw-semibold text-dark">Edit Profile</span>
                            </button>
                        </li>
                        <li><hr className="dropdown-divider mx-2 opacity-50" /></li>
                        <li>
                            <button className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-3 text-danger" onClick={handleLogout}>
                                <span className="material-symbols-outlined fs-5">logout</span>
                                <span className="fw-semibold">Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <ProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                user={admin} 
                onUpdate={handleProfileUpdate} 
            />
        </aside>
    );
};

export default AdminSidebar;
