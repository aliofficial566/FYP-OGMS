import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AuthModal from '../components/AuthModal';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
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
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        streetAddress: '',
        city: '',
        zipCode: '',
        contactNumber: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            if (parsedCart.length === 0) {
                navigate('/cart');
                return;
            }
            setCartItems(parsedCart);
        } else {
            navigate('/cart');
        }

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.final_price || item.price);
        return acc + (price * item.quantity);
    }, 0);

    const deliveryFee = 0.00;
    const tax = 0.00;
    const total = subtotal + deliveryFee + tax;

    const handlePlaceOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setToast({ type: 'warning', title: 'Login Required', message: 'Please login to place your order.' });
            setShowAuthModal(true);
            return;
        }

        // Validation
        if (!formData.fullName || !formData.streetAddress || !formData.city || !formData.zipCode || !formData.contactNumber) {
            setToast({ type: 'error', title: 'Missing Info', message: 'Please fill in all required delivery details.' });
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                delivery_address: `${formData.streetAddress}, ${formData.city}, ${formData.zipCode}`,
                city: formData.city,
                total_amount: total,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    product_name: item.title,
                    price: parseFloat(item.price),
                    discount_percent: item.discount_percent || 0,
                    final_price: parseFloat(item.final_price || item.price),
                    quantity: item.quantity
                }))
            };

            await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setToast({
                type: 'success',
                title: 'Order Placed!',
                message: 'Your order has been placed successfully.'
            });

            // Clear cart
            localStorage.removeItem('cart');
            
            setOrderSuccess(true);
            
            setTimeout(() => {
                navigate('/my-orders');
            }, 4000);
        } catch (error) {
            console.error("Error placing order:", error);
            setToast({
                type: 'error',
                title: 'Order Failed',
                message: error.response?.data?.message || 'Failed to place order. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-bg min-vh-100 pb-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            
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

            <div className="container">
                {orderSuccess ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5 animate-fade">
                        <div className="bg-white rounded-5 shadow-lg p-5 text-center" style={{ maxWidth: '600px' }}>
                            <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-4 animate-bounce" style={{ width: '100px', height: '100px' }}>
                                <span className="material-symbols-outlined text-success display-1">check_circle</span>
                            </div>
                            <h1 className="fw-black text-dark mb-3">Thank You for Your Order!</h1>
                            <p className="text-muted fw-semibold fs-5 mb-4">Your groceries are being prepared with care and will be on their way soon.</p>
                            
                            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                                <div className="spinner-grow text-success spinner-grow-sm" role="status"></div>
                                <span className="text-muted small fw-bold">Redirecting you to your orders in a few seconds...</span>
                            </div>

                            <div className="bg-light rounded-4 p-4 d-flex align-items-center gap-3 text-start">
                                <div className="rounded-3 bg-white p-2 shadow-sm">
                                    <span className="material-symbols-outlined text-success">local_shipping</span>
                                </div>
                                <div>
                                    <h6 className="fw-black text-dark mb-0">Fast Delivery</h6>
                                    <p className="text-muted small mb-0 fw-semibold">Our rider will contact you upon arrival.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumbs */}
                        <nav aria-label="breadcrumb" className="mb-3">
                            <ol className="breadcrumb small fw-semibold mb-0">
                                <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none text-muted">Cart</Link></li>
                                <li className="breadcrumb-item active text-dark" aria-current="page">Checkout</li>
                            </ol>
                        </nav>

                        <div className="mb-4">
                            <h2 className="fw-black text-dark mb-1">Secure Checkout</h2>
                            <p className="text-muted small mb-0">Complete your purchase by providing your delivery and payment information.</p>
                        </div>

                <div className="row g-4">
                    {/* Left Column: Delivery & Payment */}
                    <div className="col-lg-7">
                        {/* Delivery Details Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: '#f0fdf4', color: '#10B981' }}>
                                    <span className="material-symbols-outlined fs-5">local_shipping</span>
                                </div>
                                <h5 className="fw-bold m-0">Delivery Details</h5>
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-dark mb-1">Full Name <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        className="form-control rounded-3 py-2 px-3 border-light-subtle bg-light bg-opacity-50 small" 
                                        placeholder="e.g. Alexander Hamilton"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-dark mb-1">Street Address <span className="text-danger">*</span></label>
                                    <textarea 
                                        name="streetAddress"
                                        className="form-control rounded-3 py-2 px-3 border-light-subtle bg-light bg-opacity-50 small" 
                                        rows="2"
                                        placeholder="Apartment, suite, unit, building, floor, etc."
                                        value={formData.streetAddress}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-dark mb-1">City <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="city"
                                        className="form-control rounded-3 py-2 px-3 border-light-subtle bg-light bg-opacity-50 small" 
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-dark mb-1">Zip Code <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="zipCode"
                                        className="form-control rounded-3 py-2 px-3 border-light-subtle bg-light bg-opacity-50 small" 
                                        placeholder="10001"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-dark mb-1">Contact Number <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="contactNumber"
                                        className="form-control rounded-3 py-2 px-3 border-light-subtle bg-light bg-opacity-50 small" 
                                        placeholder="+92 (300) 000-0000"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: '#f0fdf4', color: '#10B981' }}>
                                    <span className="material-symbols-outlined fs-5">payments</span>
                                </div>
                                <h5 className="fw-bold m-0">Payment Method</h5>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div 
                                        className={`p-3 rounded-4 border-2 cursor-pointer transition-all d-flex align-items-center gap-3 ${paymentMethod === 'cod' ? 'border-success bg-success bg-opacity-10' : 'border-light-subtle bg-light'}`}
                                        onClick={() => setPaymentMethod('cod')}
                                        style={{ border: paymentMethod === 'cod' ? '2px solid #10B981' : '1px solid #e2e8f0' }}
                                    >
                                        <span className={`material-symbols-outlined fs-4 ${paymentMethod === 'cod' ? 'text-success' : 'text-muted'}`}>payments</span>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0 small">Cash on Delivery</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Pay when you receive items</p>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <span className="material-symbols-outlined fs-5 text-success">check_circle</span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div 
                                        className="p-3 rounded-4 border border-light-subtle bg-light opacity-50 cursor-not-allowed d-flex align-items-center gap-3"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <span className="material-symbols-outlined fs-4 text-muted">credit_card</span>
                                        <div>
                                            <h6 className="fw-bold mb-0 small text-muted">Credit Card</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">Order Summary</h5>
                                <span className="badge rounded-pill px-2 py-1 fw-bold" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '10px' }}>
                                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                                </span>
                            </div>

                            {/* Item List */}
                            <div className="mb-4 custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {cartItems.map((item) => (
                                    <div key={item.id} className="d-flex align-items-center gap-2 mb-3">
                                        <div className="rounded-3 bg-light overflow-hidden p-1 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, minWidth: 44 }}>
                                            <img src={item.image} alt={item.title} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0 text-dark text-truncate small" style={{ maxWidth: '160px' }}>{item.title}</h6>
                                            <p className="text-muted mb-0 fw-semibold" style={{ fontSize: '10px' }}>Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-end">
                                            <p className="fw-bold text-dark m-0 small">Rs. {item.final_price || item.price}</p>
                                            {item.discount_percent > 0 && (
                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                    <span className="badge bg-danger p-1" style={{ fontSize: '8px' }}>{item.discount_percent}% OFF</span>
                                                    <p className="text-muted text-decoration-line-through m-0" style={{ fontSize: '9px' }}>Rs. {item.price}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-3 opacity-10" />

                            <div className="d-flex justify-content-between mb-2 text-secondary fw-medium small">
                                <span>Subtotal</span>
                                <span className="text-dark fw-bold">Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-secondary fw-medium small">
                                <span>Delivery Fee</span>
                                <span className="text-dark fw-bold">Rs. {deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-secondary fw-medium small">
                                <span>Estimated Tax</span>
                                <span className="text-dark fw-bold">Rs. {tax.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-4">
                                <h5 className="fw-black text-dark m-0">Total</h5>
                                <h5 className="fw-black text-dark m-0">Rs. {total.toFixed(2)}</h5>
                            </div>

                            <button 
                                className={`btn btn-success w-100 rounded-3 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all hover-lift ${loading ? 'disabled' : ''}`}
                                style={{ backgroundColor: '#10B981', border: 'none', height: '48px' }}
                                onClick={handlePlaceOrder}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    <>
                                        Place Order
                                        <span className="material-symbols-outlined fs-5">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <p className="text-center text-muted small mt-3 px-3 mb-0" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                By placing your order, you agree to our terms of service and privacy policy.
                            </p>
                        </div>

                        {/* Need Help Card - Now integrated below Order Summary button */}
                        <div className="p-3 rounded-4 border-dashed bg-light bg-opacity-50" style={{ border: '2px dashed #e2e8f0' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                                    <span className="material-symbols-outlined text-success fs-5">headset_mic</span>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 small">Need help?</h6>
                                    <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Contact our support at 1-800-OGMS-HELP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            )}
        </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                .checkout-page-bg {
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                }

                .fw-black {
                    font-weight: 900;
                }
                
                .breadcrumb-item + .breadcrumb-item::before {
                    content: '>';
                    font-size: 10px;
                    vertical-align: middle;
                    color: #94a3b8;
                }

                .rounded-5 {
                    border-radius: 2rem !important;
                }

                .form-control:focus {
                    background-color: #fff;
                    border-color: #10B981;
                    box-shadow: 0 0 0 0.25rem rgba(16, 185, 129, 0.1);
                }

                .hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15) !important;
                }

                .cursor-pointer {
                    cursor: pointer;
                }

                .cursor-not-allowed {
                    cursor: not-allowed;
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

export default Checkout;
