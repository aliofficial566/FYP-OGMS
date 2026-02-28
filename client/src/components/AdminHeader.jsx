import React from 'react';

const AdminHeader = ({ admin, onLogout }) => {
    return (
        <header className="admin-header d-flex align-items-center justify-content-between">
            <style>{`
                .admin-header {
                    height: 72px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 0 40px;
                    position: sticky;
                    top: 0;
                    z-index: 90;
                }

                .search-container {
                    max-width: 500px;
                    width: 100%;
                    position: relative;
                }

                .search-input {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 100px;
                    height: 48px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding-left: 52px;
                    color: #1e293b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    width: 100%;
                }

                .search-input:focus {
                    background: #ffffff;
                    border-color: #10b981;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
                    outline: none;
                }

                .search-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 20px;
                    pointer-events: none;
                }

                .nav-icon-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: all 0.2s;
                    cursor: pointer;
                    position: relative;
                }

                .nav-icon-btn:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                    transform: translateY(-1px);
                }

                .notification-dot {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border: 2px solid #fff;
                    border-radius: 50%;
                }

                .header-divider {
                    width: 1px;
                    height: 32px;
                    background: #e2e8f0;
                    margin: 0 8px;
                }

                .admin-profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                }

                .admin-profile-btn:hover {
                    background: #f8fafc;
                }
            `}</style>

            <div className="search-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search orders, products, customers..."
                />
            </div>

            <div className="d-flex align-items-center gap-3">
                <div className="nav-icon-btn shadow-sm">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="notification-dot"></span>
                </div>

                <div className="header-divider"></div>

                <button className="admin-profile-btn">
                    <div className="text-end d-none d-sm-block">
                        <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
                            {admin?.name || 'Admin User'}
                        </p>
                        <p className="mb-0 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                            Head of Operations
                        </p>
                    </div>
                    <div className="rounded-circle border border-2 border-white shadow-sm overflow-hidden" style={{ width: 44, height: 44 }}>
                        <img
                            src="https://lh3.googleusercontent.com/a/ACg8ocLwV2Zxb52C1S6Nl6D2Z8G7C5J3qG0E=s96-c"
                            className="w-100 h-100 object-fit-cover"
                            alt="Avatar"
                        />
                    </div>
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: 20 }}>expand_more</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
