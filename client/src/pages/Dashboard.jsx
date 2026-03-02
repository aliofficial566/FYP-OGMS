import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { Logo, BRANDING } from '../components/Branding';
import AuthModal from '../components/AuthModal';

// --- Components ---
const ProductCard = ({ id, title, weight, price, image, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    const handleMinus = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handlePlus = () => {
        setQuantity(prev => prev + 1);
    };

    return (
        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden product-card-hover">
            <div className="position-relative overflow-hidden" style={{ height: '200px', backgroundColor: '#f8fafc', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <img src={image} alt={title} className="w-100 h-100 object-fit-cover transition-transform" style={{ transition: 'transform 0.4s ease' }} />
            </div>
            <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title fw-bold text-dark mb-0 pe-2" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{title}</h5>
                    <span className="fw-bold text-success fs-5 text-nowrap" style={{ color: '#10B981', lineHeight: '1' }}>{price}</span>
                </div>
                <p className="text-muted small mb-3">{weight}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
                    <div className="d-flex align-items-center bg-light rounded-pill px-1 py-1 border shadow-sm" style={{ backgroundColor: '#F0FDF4 !important' }}>
                        <button className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                            style={{ width: '28px', height: '28px', color: '#10B981' }}
                            onClick={handleMinus}>
                            <span className="material-symbols-outlined fs-5">remove</span>
                        </button>
                        <span className="fw-bold px-2 text-dark" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{quantity}</span>
                        <button className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                            style={{ width: '28px', height: '28px', color: '#10B981' }}
                            onClick={handlePlus}>
                            <span className="material-symbols-outlined fs-5">add</span>
                        </button>
                    </div>

                    <button
                        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border"
                        style={{ width: '40px', height: '40px', backgroundColor: '#F0FDF4', color: '#10B981' }}
                        onClick={() => onAddToCart({ id, title, price, quantity, image })}
                    >
                        <span className="material-symbols-outlined fs-5">shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ cartCount, onLogout, user, navigate, onOpenAuth }) => (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
        <div className="container">
            <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                <Logo size="md" />
            </a>

            <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#dashboardNavbar">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="dashboardNavbar">
                <div className="mx-lg-auto my-3 my-lg-0 w-100 px-lg-4 d-flex align-items-center gap-2" style={{ maxWidth: '650px' }}>
                    <div className="input-group bg-light rounded-pill overflow-hidden border-0 flex-grow-1">
                        <span className="input-group-text bg-transparent border-0 ps-3 pe-2 text-muted">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input type="text" className="form-control bg-transparent border-0 py-2 ps-2 shadow-none" placeholder="Search for groceries..." />
                    </div>
                    <button className="btn btn-light rounded-pill border-0 d-flex align-items-center gap-2 px-3 py-2 text-muted shadow-sm hover-bg-light" type="button">
                        <span className="material-symbols-outlined fs-5">tune</span>
                        Filter
                    </button>
                </div>

                <div className="navbar-nav gap-2 align-items-center">
                    <button className="btn d-flex align-items-center gap-2 px-3 position-relative text-dark fw-medium" onClick={() => navigate('/cart')}>
                        <span className="material-symbols-outlined fs-4 text-secondary">shopping_cart</span>
                        <span className="d-lg-none">Cart</span>
                        {cartCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: '#10B981', marginTop: '10px', marginLeft: '-15px' }}>
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="dropdown">
                            <button className="btn d-flex align-items-center gap-2 px-3 text-dark fw-medium border-0 shadow-none dropdown-toggle hide-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span className="material-symbols-outlined fs-4 text-secondary">account_circle</span>
                                <span>{user.name.split(' ')[0]}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2" style={{ minWidth: '200px' }}>
                                <li>
                                    <h6 className="dropdown-header text-muted small pb-1">Signed in as</h6>
                                    <div className="px-3 py-1 mb-2">
                                        <div className="fw-bold text-dark">{user.name}</div>
                                        <div className="text-secondary small">{user.email}</div>
                                    </div>
                                </li>
                                <li><hr className="dropdown-divider opacity-50" /></li>
                                <li>
                                    <a className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2" href="#" onClick={(e) => e.preventDefault()}>
                                        <span className="material-symbols-outlined fs-5 text-secondary">edit</span>
                                        <span>Edit Profile</span>
                                    </a>
                                </li>
                                <li><hr className="dropdown-divider opacity-50" /></li>
                                <li>
                                    <button className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-danger" onClick={handleLogout}>
                                        <span className="material-symbols-outlined fs-5">logout</span>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="d-flex gap-2 ms-lg-2">
                            <button
                                className="btn btn-outline-success rounded-pill px-3 fw-bold btn-sm"
                                onClick={() => onOpenAuth('login')}
                                style={{ borderColor: '#10B981', color: '#10B981' }}
                            >
                                Sign In
                            </button>
                            <button
                                className="btn btn-success rounded-pill px-3 fw-bold btn-sm"
                                onClick={() => onOpenAuth('signup')}
                                style={{ backgroundColor: '#10B981', border: 'none' }}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </nav>
);

const Sidebar = () => (
    <div className="card border-0 shadow-sm rounded-4 px-3 py-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
        <h5 className="fw-bold mb-4 px-2 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">category</span>
            All Categories
        </h5>
        <div className="nav flex-column gap-1">
            <a href="#" className="nav-link rounded-3 active d-flex align-items-center justify-content-between p-2 px-3 mb-1" style={{ backgroundColor: '#F0FDF4', color: '#10B981', borderLeft: '4px solid #10B981' }}>
                <div className="d-flex align-items-center gap-2 fw-bold">
                    <span className="material-symbols-outlined fs-5">grid_view</span>
                    All Products
                </div>
            </a>
            {[
                { name: 'Milks & Dairies', icon: 'water_drop', count: 30 },
                { name: 'Fresh Seafood', icon: 'set_meal', count: 45 },
                { name: 'Pet Foods', icon: 'pets', count: 12 },
                { name: 'Baking Material', icon: 'cake', count: 87 },
                { name: 'Fresh Fruit', icon: 'icecream', count: 24 }
            ].map((cat, i) => (
                <a key={i} href="#" className="nav-link rounded-3 text-dark d-flex align-items-center justify-content-between p-2 px-3 hover-bg-light transition-all">
                    <div className="d-flex align-items-center gap-3 fw-semibold">
                        <span className="material-symbols-outlined text-secondary fs-5">{cat.icon}</span>
                        {cat.name}
                    </div>
                    <span className="badge bg-light text-muted rounded-pill fw-normal px-2" style={{ fontSize: '11px' }}>{cat.count}</span>
                </a>
            ))}
        </div>

        <div className="mt-5 p-4 rounded-4 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            <div className="position-relative">
                <span className="badge bg-warning text-dark mb-3 rounded-pill fw-bold" style={{ fontSize: '10px' }}>SPECIAL OFFER</span>
                <h5 className="fw-bold mb-3">Save 17% on <br />Organic Juice</h5>
                <button className="btn btn-light btn-sm w-100 rounded-pill fw-bold text-success py-2">Shop Now</button>
            </div>
        </div>
    </div>
);

const Pagination = () => (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-5 mb-4">
        <button className="btn btn-outline-light rounded-4 d-flex align-items-center justify-content-center p-0 border shadow-sm hover-bg-light" style={{ width: '45px', height: '45px', color: '#64748b' }}>
            <span className="material-symbols-outlined fs-5">chevron_left</span>
        </button>
        <button className="btn btn-success rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center p-0" style={{ width: '45px', height: '45px', backgroundColor: '#10B981', border: 'none' }}>
            1
        </button>
        <button className="btn btn-outline-light rounded-4 fw-bold d-flex align-items-center justify-content-center p-0 border shadow-sm text-secondary hover-bg-light" style={{ width: '45px', height: '45px' }}>
            2
        </button>
        <button className="btn btn-outline-light rounded-4 fw-bold d-flex align-items-center justify-content-center p-0 border shadow-sm text-secondary hover-bg-light" style={{ width: '45px', height: '45px' }}>
            3
        </button>
        <span className="text-secondary fw-bold px-1">...</span>
        <button className="btn btn-outline-light rounded-4 fw-bold d-flex align-items-center justify-content-center p-0 border shadow-sm text-secondary hover-bg-light" style={{ width: '45px', height: '45px' }}>
            8
        </button>
        <button className="btn btn-outline-light rounded-4 d-flex align-items-center justify-content-center p-0 border shadow-sm hover-bg-light" style={{ width: '45px', height: '45px', color: '#64748b' }}>
            <span className="material-symbols-outlined fs-5">chevron_right</span>
        </button>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null); // { type, title, message }
    const [authModal, setAuthModal] = useState({ isOpen: false, initialView: 'login' });

    // Mock Products
    const products = [
        { id: 1, title: 'Artisan Sourdough', weight: 'House-made, 800g', price: '$5.00', image: '/images/sourdough.png' },
        { id: 2, title: 'Avocado', weight: 'Medium size, each', price: '$2.00', image: '/images/avocado.png' },
        { id: 3, title: 'Fresh Broccoli', weight: 'Organic head, ~500g', price: '$2.75', image: '/images/broccoli.png' },
        { id: 4, title: 'Mixed Bell Peppers', weight: 'Pack of 3 (Red, Yellow, Green)', price: '$3.99', image: '/images/peppers.png' },
        { id: 5, title: 'Organic Gala Apples', weight: '1kg bag', price: '$4.99', image: '/images/apples.jpg' },
        { id: 6, title: 'Fresh Whole Milk', weight: '1 Gallon', price: '$3.50', image: '/images/milk.jpg' },
        { id: 7, title: 'Cage-Free Eggs', weight: '12 Large Brown Eggs', price: '$4.25', image: '/images/eggs.jpg' },
        { id: 8, title: 'Greek Yogurt', weight: 'Plain, 150g', price: '$1.99', image: '/images/yogurt.jpg' },
        { id: 9, title: 'Fresh Salmon Fillet', weight: 'Wild caught, 250g', price: '$12.50', image: '/images/salmon.jpg' },
        { id: 10, title: 'Premium Beef Steak', weight: 'Angus ribeye, 300g', price: '$15.99', image: '/images/steak.jpg' },
        { id: 11, title: 'Organic Strawberries', weight: 'Freshly picked, 500g', price: '$6.50', image: '/images/strawberries.jpg' },
        { id: 12, title: 'Penne Rigate Pasta', weight: 'Durum wheat, 500g', price: '$2.25', image: '/images/pasta.jpg' },
        { id: 13, title: 'Pure Mountain Honey', weight: 'Raw & unfiltered, 250g', price: '$8.99', image: '/images/honey.jpg' },
        { id: 14, title: 'Dark Chocolate 70%', weight: 'Single origin, 100g', price: '$4.50', image: '/images/chocolate.jpg' },
        { id: 15, title: 'Premium Whole Cashews', weight: 'Roasted & salted, 200g', price: '$7.25', image: '/images/cashews.jpg' },
        { id: 16, title: 'Organic All-Purpose Flour', weight: 'Natural & unbleached, 1.5kg', price: '$5.50', image: '/images/flour.jpg' },
        { id: 17, title: 'Fresh Chicken Breast', weight: 'Value pack, 1kg', price: '$9.99', image: '/images/chicken.jpg' },
        { id: 18, title: 'Wild Jumbo Shrimp', weight: 'Peeled & deveined, 500g', price: '$14.50', image: '/images/shrimp.jpg' },
        { id: 19, title: 'Buttery Croissants', weight: 'Pack of 4', price: '$6.00', image: '/images/croissants.jpg' },
        { id: 20, title: 'Aged Cheddar Cheese', weight: 'Sharp & creamy, 250g', price: '$4.99', image: '/images/cheese.jpg' },
    ];

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleAddToCart = (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthModal({ isOpen: true, initialView: 'login' });
            return;
        }

        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            let newCart;
            if (existing) {
                newCart = prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
                );
            } else {
                newCart = [...prev, product];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));

            setToast({
                type: 'success',
                title: 'Added to Cart',
                message: `${product.title} has been added to your cart.`
            });

            return newCart;
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            if (sessionStorage.getItem('isFirstLogin') === 'true') {
                setToast({
                    type: 'success',
                    title: 'Welcome Back!',
                    message: `Glad to see you again, ${parsedUser.name}!`
                });
                sessionStorage.removeItem('isFirstLogin');
            }

            // If an admin somehow lands here while logged in, redirect them
            if (parsedUser.role === 'admin') {
                navigate('/admin/dashboard');
            }
        }
    }, [navigate]);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setToast({
            type: 'success',
            title: 'Welcome Back!',
            message: `Glad to see you again, ${userData.name}!`
        });

        // If an admin logs in, redirect them to the Admin side
        if (userData.role === 'admin') {
            setTimeout(() => navigate('/admin/dashboard'), 1500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToast({
            type: 'info',
            title: 'Logged Out',
            message: 'You have been successfully logged out.'
        });
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Notification Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <Navbar cartCount={cartCount} onLogout={handleLogout} user={user} navigate={navigate} onOpenAuth={(view) => setAuthModal({ isOpen: true, initialView: view })} />

            <AuthModal
                isOpen={authModal.isOpen}
                initialView={authModal.initialView}
                onClose={() => setAuthModal({ isOpen: false, initialView: 'login' })}
                onSuccess={handleAuthSuccess}
            />

            <div className="container py-4 py-lg-5">
                {/* Hero Layout */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-8">
                        <div className="rounded-5 p-5 text-white position-relative overflow-hidden h-100 d-flex flex-column justify-content-center" style={{ background: '#D1FAE5', minHeight: '350px' }}>
                            <div className="position-absolute top-0 end-0 h-100 w-50 d-none d-md-block" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.15 }}></div>
                            <div className="position-relative" style={{ maxWidth: '450px' }}>
                                <h1 className="display-4 fw-black text-dark mb-3">30% Off Fresh Greens & Veggies</h1>
                                <p className="text-secondary mb-4 fs-5">Start your daily shopping with our best organic collections.</p>
                                <button className="btn btn-success px-4 py-2 rounded-pill fw-bold" style={{ backgroundColor: '#10B981', border: 'none' }}>Shop Now</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="rounded-5 p-4 text-dark position-relative overflow-hidden h-100 d-flex flex-column justify-content-center border" style={{ background: '#FFF7ED' }}>
                            <h2 className="h4 fw-bold mb-2">Healthy Breakfast Easy</h2>
                            <p className="text-muted small mb-4">Save up to 50% on first order</p>
                            <button className="btn btn-outline-warning btn-sm rounded-pill fw-bold px-3 py-2 text-dark" style={{ border: '2px solid #FB923C' }}>Discover More</button>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="row g-4">
                    <div className="col-lg-3">
                        <Sidebar />
                    </div>

                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                            <h2 className="h4 fw-bold m-0 border-start border-4 border-success ps-3">Popular Products</h2>
                        </div>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
                            {products.map(p => (
                                <div className="col" key={p.id}>
                                    <ProductCard {...p} onAddToCart={handleAddToCart} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
