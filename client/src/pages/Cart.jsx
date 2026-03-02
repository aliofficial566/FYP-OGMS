import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';
import Toast from '../components/Toast';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

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
        const price = parseFloat(item.price.replace('$', ''));
        return acc + (price * item.quantity);
    }, 0);

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setToast({
                type: 'warning',
                title: 'Sign In Required',
                message: 'Please sign in to proceed with your checkout.'
            });
            // Redirect to home where the AuthModal is available
            setTimeout(() => {
                navigate('/');
            }, 1000);
            return;
        }

        setToast({
            type: 'success',
            title: 'Order Placed!',
            message: 'Your order has been placed successfully. Thank you!'
        });
        // Clear cart
        localStorage.removeItem('cart');
        setCartItems([]);
    };

    return (
        <div className="bg-light min-vh-100">
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Simple Cart Header */}
            <nav className="navbar navbar-light bg-white border-bottom py-3">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                        <Logo size="md" />
                    </a>
                    <button className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 border shadow-sm" onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined fs-5">arrow_back</span>
                        Back to Shopping
                    </button>
                </div>
            </nav>

            <div className="container py-5">
                <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-2 text-success">shopping_basket</span>
                    Your Shopping Cart
                </h2>

                <div className="row g-4">
                    <div className="col-lg-8">
                        {cartItems.length > 0 ? (
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <ul className="list-group list-group-flush">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="list-group-item p-4">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="rounded-4 bg-light p-2" style={{ width: '80px', height: '80px' }}>
                                                        <img src={item.image} alt={item.title} className="w-100 h-100 object-fit-contain" />
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <h5 className="fw-bold mb-1">{item.title}</h5>
                                                    <p className="text-success fw-bold mb-0">{item.price}</p>
                                                </div>
                                                <div className="col-auto">
                                                    <div className="d-flex align-items-center bg-light rounded-pill px-1 py-1 border shadow-sm">
                                                        <button
                                                            className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0"
                                                            style={{ width: '28px', height: '28px', color: '#10B981' }}
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                        >
                                                            <span className="material-symbols-outlined fs-5">remove</span>
                                                        </button>
                                                        <span className="fw-bold px-3 text-dark">{item.quantity}</span>
                                                        <button
                                                            className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0"
                                                            style={{ width: '28px', height: '28px', color: '#10B981' }}
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                        >
                                                            <span className="material-symbols-outlined fs-5">add</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-auto">
                                                    <button
                                                        className="btn btn-link text-danger p-2 rounded-circle hover-bg-danger-light"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                                <span className="material-symbols-outlined display-1 text-muted mb-3">shopping_cart_off</span>
                                <h3 className="fw-bold text-muted">Your cart is empty</h3>
                                <p className="text-secondary mb-4">Add some organic goodies to see them here!</p>
                                <button className="btn btn-success rounded-pill px-5 py-2 fw-bold mx-auto w-auto" onClick={() => navigate('/')}>
                                    Go Shopping
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-3 text-secondary">
                                <span>Subtotal</span>
                                <span className="fw-bold text-dark">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-secondary">
                                <span>Shipping</span>
                                <span className="fw-bold text-success">Free</span>
                            </div>
                            <hr className="my-3 opacity-50" />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fs-5 fw-bold">Total</span>
                                <span className="fs-5 fw-bold text-success">${subtotal.toFixed(2)}</span>
                            </div>

                            <button
                                className="btn btn-success w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm hover-up transition-all"
                                style={{ backgroundColor: '#10B981', border: 'none' }}
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </button>

                            {!user && (
                                <p className="text-center text-muted small mt-3">
                                    You'll need to sign in on the home page to complete your order.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
