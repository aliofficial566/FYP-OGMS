import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminHeader = ({ admin, onLogout }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], orders: [], users: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults({ products: [], orders: [], users: [] });
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            setShowDropdown(true);

            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [prodRes, orderRes, userRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/products', config),
                    axios.get('http://localhost:5000/api/orders', config),
                    axios.get('http://localhost:5000/api/users', config)
                ]);

                const term = query.toLowerCase();
                
                const productsList = prodRes.data.products || prodRes.data || [];
                const products = productsList.filter(p => 
                    p.name?.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term)
                ).slice(0, 3);
                
                const ordersList = orderRes.data.data || orderRes.data || [];
                const orders = ordersList.filter(o => 
                    o.order_number?.toLowerCase().includes(term) || o.customer_name?.toLowerCase().includes(term)
                ).slice(0, 3);
                
                const usersList = userRes.data.data || userRes.data || [];
                const users = usersList.filter(u => 
                    u.full_name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
                ).slice(0, 3);

                setResults({ products, orders, users });
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <header className="admin-header d-flex align-items-center justify-content-between">
            <style>{`
                .admin-header {
                    height: 72px;
                    background: #ffffff;
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

                .hide-caret::after {
                    display: none !important;
                }

                .global-search-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 8px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                    overflow: hidden;
                    z-index: 1000;
                }

                .search-section-title {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    padding: 12px 20px 8px;
                }

                .search-result-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .search-result-item:hover {
                    background: #ecfdf5;
                }
            `}</style>

            <div className="search-container" ref={searchRef}>
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search orders, products, customers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setShowDropdown(true)}
                />
                
                {showDropdown && (
                    <div className="global-search-dropdown animate-fade">
                        {isSearching ? (
                            <div className="text-center py-4">
                                <div className="spinner-border spinner-border-sm text-success"></div>
                            </div>
                        ) : results.products.length === 0 && results.orders.length === 0 && results.users.length === 0 ? (
                            <div className="text-center py-4 text-muted fw-bold small">No results found for "{query}"</div>
                        ) : (
                            <div className="py-2 max-h-400 overflow-auto">
                                {results.products.length > 0 && (
                                    <>
                                        <div className="search-section-title">Products</div>
                                        {results.products.map(p => (
                                            <div key={`p-${p.product_id}`} className="search-result-item" onClick={() => { setShowDropdown(false); navigate('/admin/products'); }}>
                                                <div className="rounded bg-light d-flex align-items-center justify-content-center text-success fw-bold" style={{width: 32, height: 32, fontSize: 12}}>P</div>
                                                <div>
                                                    <div className="text-dark fw-bold small mb-0">{p.name}</div>
                                                    <div className="text-muted" style={{fontSize: 10}}>{p.brand}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {results.orders.length > 0 && (
                                    <>
                                        <div className="search-section-title border-top mt-2">Orders</div>
                                        {results.orders.map(o => (
                                            <div key={`o-${o.order_id}`} className="search-result-item" onClick={() => { setShowDropdown(false); navigate('/admin/orders'); }}>
                                                <div className="rounded bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{width: 32, height: 32, fontSize: 12}}>O</div>
                                                <div>
                                                    <div className="text-dark fw-bold small mb-0">{o.order_number}</div>
                                                    <div className="text-muted" style={{fontSize: 10}}>{o.customer_name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {results.users.length > 0 && (
                                    <>
                                        <div className="search-section-title border-top mt-2">Customers</div>
                                        {results.users.map(u => (
                                            <div key={`u-${u.id}`} className="search-result-item" onClick={() => { setShowDropdown(false); navigate('/admin/users'); }}>
                                                <div className="rounded bg-light d-flex align-items-center justify-content-center text-warning fw-bold" style={{width: 32, height: 32, fontSize: 12}}>C</div>
                                                <div>
                                                    <div className="text-dark fw-bold small mb-0">{u.full_name}</div>
                                                    <div className="text-muted" style={{fontSize: 10}}>{u.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="d-flex align-items-center gap-3">
            </div>
        </header>
    );
};

export default AdminHeader;
