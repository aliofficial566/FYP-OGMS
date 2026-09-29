import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error parsing cart from localStorage", e);
            return [];
        }
    });

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Error parsing user from localStorage", e);
            return null;
        }
    });
    const [toast, setToast] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    useEffect(() => {
        // Sync user state if localStorage changes (e.g. from another tab)
        const handleStorageChange = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) setUser(JSON.parse(savedUser));
            
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) setCartItems(parsed);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setToast({
            type: 'info',
            title: 'Item Removed',
            message: 'Item has been removed from your cart.'
        });
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.final_price || item.price);
        return acc + (price * item.quantity);
    }, 0);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="cart-page-bg min-vh-100 pb-5">
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <Navbar 
                cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                onLogout={handleLogout}
                user={user}
                navigate={navigate}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateUser}
            />

            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                initialView="login"
                onSuccess={() => {
                    setShowAuthModal(false);
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) setUser(JSON.parse(savedUser));
                }}
            />

            <div className="container py-5">
                {/* Breadcrumbs */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb small fw-semibold mb-0">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
                        <li className="breadcrumb-item active text-dark" aria-current="page">Shopping Cart</li>
                    </ol>
                </nav>

                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h2 className="fw-black text-dark mb-1">Your Shopping Cart</h2>
                        <p className="text-muted small mb-0">Review your items before proceeding to checkout.</p>
                    </div>
                    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '12px' }}>
                        {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                    </span>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        {cartItems.length > 0 ? (
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle m-0">
                                        <thead className="bg-light border-bottom">
                                            <tr>
                                                <th className="px-4 py-3 text-muted small fw-bold" style={{ width: '45%' }}>PRODUCT</th>
                                                <th className="py-3 text-muted small fw-bold text-center" style={{ width: '20%' }}>PRICE</th>
                                                <th className="py-3 text-muted small fw-bold text-center" style={{ width: '20%' }}>QUANTITY</th>
                                                <th className="py-3 text-muted small fw-bold text-end pe-4" style={{ width: '15%' }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.id} className="border-bottom border-light">
                                                    <td className="px-4 py-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-4 bg-light p-2 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', minWidth: '70px' }}>
                                                                <img src={item.image} alt={item.title} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold mb-1 text-dark">{item.title}</h6>
                                                                <button 
                                                                    className="btn btn-link text-danger p-0 small text-decoration-none d-flex align-items-center gap-1"
                                                                    onClick={() => removeItem(item.id)}
                                                                >
                                                                    <span className="material-symbols-outlined fs-6">delete</span>
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="fw-bold text-dark">Rs. {item.final_price || item.price}</div>
                                                        {item.discount_percent > 0 && (
                                                            <div className="text-muted text-decoration-line-through small" style={{ fontSize: '10px' }}>Rs. {item.price}</div>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-inline-flex align-items-center bg-light rounded-pill px-1 py-1 border shadow-sm" style={{ backgroundColor: '#ecfdf5' }}>
                                                            <button
                                                                className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                                                                style={{ width: '28px', height: '28px', color: '#10b981' }}
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                            >
                                                                <span className="material-symbols-outlined fs-5">remove</span>
                                                            </button>
                                                            <span className="fw-bold px-3 text-dark" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                            <button
                                                                className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                                                                style={{ width: '28px', height: '28px', color: '#10b981' }}
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                            >
                                                                <span className="material-symbols-outlined fs-5">add</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <span className="fw-black text-dark fs-6">Rs. {(parseFloat(item.final_price || item.price) * item.quantity).toFixed(0)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                <div className="mb-4">
                                    <span className="material-symbols-outlined display-1 text-light">shopping_cart</span>
                                </div>
                                <h3 className="fw-bold text-dark mb-2">Your cart is empty</h3>
                                <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
                                <button className="btn btn-success rounded-3 px-5 py-2 fw-bold shadow-sm transition-all hover-lift" style={{ backgroundColor: '#10B981', border: 'none' }} onClick={() => navigate('/')}>
                                    Start Shopping
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '120px', zIndex: 10 }}>
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Subtotal</span>
                                <span className="fw-bold text-dark">Rs. {subtotal.toFixed(0)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Shipping</span>
                                <span className="fw-bold text-success">Free</span>
                            </div>
                            
                            <hr className="my-4 opacity-10" />

                            <div className="d-flex justify-content-between mb-4">
                                <h4 className="fw-black text-dark m-0">Total</h4>
                                <h4 className="fw-black text-success m-0">Rs. {subtotal.toFixed(0)}</h4>
                            </div>

                            <button
                                className={`btn btn-success w-100 rounded-3 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all hover-lift ${cartItems.length === 0 ? 'disabled' : ''}`}
                                onClick={handleCheckout}
                                style={{ backgroundColor: '#10B981', border: 'none', height: '48px' }}
                            >
                                Proceed to Checkout
                                <span className="material-symbols-outlined fs-5">arrow_forward</span>
                            </button>

                            <div className="mt-4 p-3 rounded-4 bg-light text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mb-1">
                                    <span className="material-symbols-outlined fs-5">verified_user</span>
                                    <span>Secure checkout guaranteed</span>
                                </div>
                                <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>Shop with confidence at OGMS.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                :root {
                    --brand-green: #10b981;
                    --brand-green-light: #ecfdf5;
                }

                .cart-page-bg {
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                }

                .fw-black { font-weight: 900; }
                
                .breadcrumb-item + .breadcrumb-item::before {
                    content: '>';
                    font-size: 10px;
                    vertical-align: middle;
                    color: #94a3b8;
                }

                .btn-white {
                    background-color: white;
                    color: #10B981;
                }

                .hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15) !important;
                }

                .table > :not(caption) > * > * {
                    background-color: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Cart;
