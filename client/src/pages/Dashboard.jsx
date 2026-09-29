import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import { Logo, BRANDING } from '../components/Branding';
import { generateSlug } from '../helpers';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';

// --- Components ---
const ProductCard = ({ id, title, weight, price, discount_percent, final_price, image, onAddToCart, navigate }) => {
    const [quantity, setQuantity] = useState(1);

    const handleMinus = (e) => {
        e.stopPropagation();
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handlePlus = (e) => {
        e.stopPropagation();
        setQuantity(prev => prev + 1);
    };

    const hasDiscount = discount_percent > 0;

    return (
        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden product-card-hover position-relative bg-white p-3">
            {hasDiscount && (
                <div className="position-absolute top-0 end-0 m-4 z-3">
                    <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm" style={{ fontSize: '0.75rem' }}>
                        {discount_percent}% OFF
                    </span>
                </div>
            )}
            <div className="position-relative overflow-hidden rounded-4" style={{ height: '190px', backgroundColor: '#f8fafc' }}>
                <img src={image} alt={title} className="w-100 h-100 object-fit-cover transition-transform" style={{ transition: 'transform 0.4s ease' }} />
                
                {/* Hover Overlay */}
                <div className="details-overlay" onClick={() => navigate(`/product/${generateSlug(title)}`)}>
                    <span>
                        <span className="material-symbols-outlined fs-5">visibility</span>
                        See Details
                    </span>
                </div>
            </div>
            <div className="card-body pt-3 px-1 pb-1 d-flex flex-column">
                <div className="mb-1">
                    <h5 className="card-title fw-bold text-dark mb-0" 
                        title={title}
                        style={{ 
                            fontSize: '1rem', 
                            lineHeight: '1.2',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                        {title}
                    </h5>
                </div>
                
                <p className="text-muted small mb-2">{weight}</p>
                
                <div className="mb-3">
                    {hasDiscount ? (
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-5" style={{ color: 'var(--brand-green)' }}>Rs. {final_price}</span>
                            <span className="text-muted text-decoration-line-through small">Rs. {price}</span>
                        </div>
                    ) : (
                        <span className="fw-bold fs-5" style={{ color: 'var(--brand-green)' }}>Rs. {price}</span>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
                    <div className="d-flex align-items-center bg-light rounded-pill px-1 py-1 border shadow-sm" style={{ backgroundColor: 'var(--brand-green-light)' }}>
                        <button className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                            style={{ width: '28px', height: '28px', color: 'var(--brand-green)' }}
                            onClick={handleMinus}>
                            <span className="material-symbols-outlined fs-5">remove</span>
                        </button>
                        <span className="fw-bold px-2 text-dark" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{quantity}</span>
                        <button className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-none"
                            style={{ width: '28px', height: '28px', color: 'var(--brand-green)' }}
                            onClick={handlePlus}>
                            <span className="material-symbols-outlined fs-5">add</span>
                        </button>
                    </div>

                    <button
                        className="btn btn-light rounded-pill px-3 d-flex align-items-center justify-content-center gap-2 border shadow-sm transition-all hover-lift"
                        style={{ height: '42px', width: '100px', backgroundColor: 'var(--brand-green-light)', color: 'var(--brand-green)' }}
                        onClick={(e) => { e.stopPropagation(); onAddToCart({ id, title, price, discount_percent, final_price, quantity, image }); }}
                    >
                        <span className="material-symbols-outlined fs-5">shopping_cart</span>
                        <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ categories, activeCategory, onCategoryChange, filters, onApplyFilters, onResetFilters }) => {
    const [minPrice, setMinPrice] = useState(filters?.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(filters?.maxPrice || '');
    const [sortBy, setSortBy] = useState(filters?.sortBy || 'featured');
    const [brand, setBrand] = useState(filters?.brand || '');
    const [inStock, setInStock] = useState(filters?.inStock || false);

    useEffect(() => {
        if (filters) {
            setMinPrice(filters.minPrice);
            setMaxPrice(filters.maxPrice);
            setSortBy(filters.sortBy || 'featured');
            setBrand(filters.brand || '');
            setInStock(filters.inStock || false);
        }
    }, [filters]);

    return (
    <div className="card border-0 shadow-sm rounded-4 px-3 py-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
        <h5 className="fw-bold mb-4 px-2 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">category</span>
            All Categories
        </h5>
        <div className="nav flex-column gap-1">
            <a 
                href="#" 
                className={`nav-link rounded-3 d-flex align-items-center justify-content-between p-2 px-3 mb-1 transition-all ${activeCategory === 'All' ? 'active-cat' : 'text-dark hover-bg-light'}`}
                onClick={(e) => { e.preventDefault(); onCategoryChange('All'); }}
            >
                <div className="d-flex align-items-center gap-2 fw-bold">
                    <span className="material-symbols-outlined fs-5">grid_view</span>
                    All Products
                </div>
            </a>
            {categories.map((cat, i) => (
                <a 
                    key={i} 
                    href="#" 
                    className={`nav-link rounded-3 d-flex align-items-center justify-content-between p-2 px-3 hover-bg-light transition-all ${activeCategory === cat.name ? 'active-cat' : 'text-dark'}`}
                    onClick={(e) => { e.preventDefault(); onCategoryChange(cat.name); }}
                >
                    <div className="d-flex align-items-center gap-3 fw-semibold">
                        {cat.image_url ? (
                            <img src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`} alt={cat.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        ) : (
                            <span className="material-symbols-outlined text-secondary fs-5">label</span>
                        )}
                        {cat.name}
                    </div>
                </a>
            ))}
        </div>

        {/* Filters Section */}
        <div className="mt-4 pt-4 border-top">
            <h6 className="fw-bold mb-3 px-2 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success">tune</span>
                Filter Products
            </h6>
            
            {/* Price Range */}
            <div className="mb-3 px-2">
                <label className="form-label small fw-bold text-muted mb-1">Price Range (Rs.)</label>
                <div className="d-flex align-items-center gap-2">
                    <input type="number" className="form-control form-control-sm rounded-3" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                    <span className="text-muted">-</span>
                    <input type="number" className="form-control form-control-sm rounded-3" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
            </div>

            {/* Brand */}
            <div className="mb-3 px-2">
                <label className="form-label small fw-bold text-muted mb-1">Brand</label>
                <input type="text" className="form-control form-control-sm rounded-3" placeholder="Enter brand" value={brand} onChange={e => setBrand(e.target.value)} />
            </div>

            {/* Sort By */}
            <div className="mb-3 px-2">
                <label className="form-label small fw-bold text-muted mb-1">Sort By</label>
                <select className="form-select form-select-sm rounded-3" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="name_asc">Name: A-Z</option>
                </select>
            </div>

            {/* Availability */}
            <div className="mb-4 px-2">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="sidebarInStock" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                    <label className="form-check-label small fw-bold" htmlFor="sidebarInStock">
                        In Stock Only
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 px-2">
                <button className="btn btn-success btn-sm fw-bold py-2 rounded-pill shadow-sm" onClick={() => onApplyFilters({ minPrice, maxPrice, inStock, sortBy, brand })}>Apply Filters</button>
                <button className="btn btn-outline-secondary btn-sm fw-bold py-2 rounded-pill" onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setBrand('');
                    setInStock(false);
                    onResetFilters();
                }}>Reset</button>
            </div>
        </div>

        <style>{`
            .active-cat {
                background-color: var(--brand-green-light) !important;
                color: var(--brand-green) !important;
                border-left: 4px solid var(--brand-green);
                font-weight: 700;
            }
            .hover-bg-light:hover {
                background-color: #f8fafc;
            }
            
            /* Product Card Details Overlay */
            .details-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.03);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.3s ease;
                cursor: pointer;
                z-index: 2;
            }
            
            .product-card-hover:hover .details-overlay {
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.4);
            }
            
            .details-overlay span {
                background-color: #ffffff;
                color: var(--brand-green);
                padding: 8px 16px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 0.85rem;
                transform: translateY(10px);
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .product-card-hover:hover .details-overlay span {
                transform: translateY(0);
            }

            .product-card-hover:hover img {
                transform: scale(1.1);
            }
            
            /* Carousel Arrows */
            .carousel-control-prev,
            .carousel-control-next {
                width: 45px !important;
                height: 45px !important;
                background-color: rgba(255, 255, 255, 0.85) !important;
                border-radius: 50% !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                bottom: auto !important;
                opacity: 0.9 !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            .carousel-control-prev {
                left: 20px !important;
            }

            .carousel-control-next {
                right: 20px !important;
            }

            .carousel-control-prev:hover,
            .carousel-control-next:hover {
                background-color: #ffffff !important;
                opacity: 1 !important;
                transform: translateY(-50%) scale(1.05) !important;
            }
        `}</style>


    </div>
    );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, onItemsPerPageChange }) => {
    if (itemsPerPage <= 0 || isNaN(itemsPerPage)) return null;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="d-flex justify-content-between align-items-center mt-5 mb-4 px-2">
            {/* Spacer to balance the layout when centered */}
            {totalPages >= 1 && <div style={{ width: '80px' }} className="d-none d-md-block"></div>}

            {/* Page Numbers in the center */}
            {totalPages >= 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2">
                    <button 
                        className="btn btn-outline-light rounded-4 d-flex align-items-center justify-content-center p-0 border shadow-sm hover-bg-light" 
                        style={{ width: '45px', height: '45px', color: '#64748b' }}
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <span className="material-symbols-outlined fs-5">chevron_left</span>
                    </button>
                    
                    {pages.map(page => (
                        <button 
                            key={page}
                            className={`btn rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center p-0 ${currentPage === page ? 'btn-success' : 'btn-outline-light border text-secondary hover-bg-light'}`}
                            style={{ width: '45px', height: '45px' }}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button 
                        className="btn btn-outline-light rounded-4 d-flex align-items-center justify-content-center p-0 border shadow-sm hover-bg-light" 
                        style={{ width: '45px', height: '45px', color: '#64748b' }}
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <span className="material-symbols-outlined fs-5">chevron_right</span>
                    </button>
                </div>
            )}

            {/* Show Dropdown on the right */}
            <div className="d-flex align-items-center gap-2">
                <span className="text-muted small d-none d-md-block">Show:</span>
                <select 
                    className="form-select form-select-sm border-0 bg-white shadow-sm rounded-pill px-3 py-2 cursor-pointer transition-all hover-lift" 
                    style={{ width: '80px', fontSize: '0.85rem' }}
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
};


const getProductImage = (imgUrl) => {
    try {
        if (imgUrl) {
            const parsed = JSON.parse(imgUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0].startsWith('http') ? parsed[0] : `http://localhost:5000${parsed[0]}`;
            }
        }
    } catch (e) {}
    return imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`) : '/images/placeholder.png';
};

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null); // { type, title, message }
    const [authModal, setAuthModal] = useState({ isOpen: false, initialView: 'login', message: null });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Real Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [catalogues, setCatalogues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get('search');
        const categoryParam = params.get('category');
        if (searchParam) {
            setSearchQuery(searchParam);
        }
        if (categoryParam) {
            setActiveCategory(categoryParam);
        }
        if (params.get('sessionExpired') === 'true') {
            setAuthModal({ isOpen: true, initialView: 'login', message: 'Your session has been expired' });
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (params.get('loginRequired') === 'true') {
            setAuthModal({ isOpen: true, initialView: 'login', message: 'Please login first' });
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search]);

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        inStock: false
    });
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);

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
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleAddToCart = (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthModal({
                isOpen: true,
                initialView: 'login',
                message: 'Login Required to add the product in cart'
            });
            return;
        }

        setCartItems(prev => {
            const existing = prev.find(item => item.id === (product.id || product.product_id));
            let newCart;
            if (existing) {
                newCart = prev.map(item =>
                    item.id === (product.id || product.product_id) ? { ...item, quantity: item.quantity + product.quantity } : item
                );
            } else {
                newCart = [...prev, { ...product, id: product.product_id || product.id }];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));

            setToast({
                type: 'success',
                title: 'Added to Cart',
                message: `${product.name || product.title} has been added to your cart.`
            });

            return newCart;
        });
    };

    // Fetch Categories once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();

        const fetchCatalogues = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/catalogues');
                setCatalogues(res.data);
            } catch (error) {
                console.error("Error fetching catalogues:", error);
            }
        };
        fetchCatalogues();
    }, []);

    // Fetch Products with pagination/filtering
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5000/api/products', {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        category: activeCategory,
                        search: searchQuery,
                        minPrice: filters.minPrice,
                        maxPrice: filters.maxPrice,
                        inStock: filters.inStock,
                        brand: filters.brand,
                        sort: sortBy
                    }
                });
                setProducts(res.data.products);
                setTotalItems(res.data.total);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, activeCategory, searchQuery, filters, sortBy, itemsPerPage]);

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

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, filters, sortBy, itemsPerPage]);

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        if (newFilters.sortBy) {
            setSortBy(newFilters.sortBy);
        }
    };

    const handleResetFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', inStock: false, brand: '' });
        setActiveCategory('All');
        setSearchQuery('');
        setSortBy('featured');
    };

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

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <div className="bg-white min-vh-100">
            {/* Notification Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <Navbar 
                cartCount={cartCount} 
                onLogout={handleLogout} 
                user={user} 
                navigate={navigate} 
                onOpenAuth={(view) => setAuthModal({ isOpen: true, initialView: view })}
                onOpenProfile={() => setIsProfileOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
            />

            <AuthModal
                isOpen={authModal.isOpen}
                initialView={authModal.initialView}
                message={authModal.message}
                onClose={() => setAuthModal({ isOpen: false, initialView: 'login', message: null })}
                onSuccess={handleAuthSuccess}
            />

            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateUser}
            />

            <div className="py-4 py-lg-5 mx-auto" style={{ width: '75%', fontFamily: "'Inter', sans-serif" }}>
                {/* Dynamic Catalogue Banner Carousel */}
                {catalogues.length > 0 && (
                    <div id="catalogueCarousel" className="carousel slide mb-5 shadow-sm rounded-5 overflow-hidden" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            {catalogues.map((_, index) => (
                                <button 
                                    key={index} 
                                    type="button" 
                                    data-bs-target="#catalogueCarousel" 
                                    data-bs-slide-to={index} 
                                    className={index === 0 ? 'active' : ''}
                                    aria-current={index === 0 ? 'true' : 'false'}
                                ></button>
                            ))}
                        </div>
                        <div className="carousel-inner">
                            {catalogues.map((cat, index) => (
                                <div 
                                    key={cat.catalogue_id} 
                                    className={`carousel-item ${index === 0 ? 'active' : ''} cursor-pointer`}
                                    onClick={() => navigate(`/catalogue/${generateSlug(cat.name)}`)}
                                    style={{ height: '70vh' }}
                                >
                                    {/* Background Image with Gradient Overlay */}
                                    <div className="position-absolute top-0 start-0 w-100 h-100">
                                        <img 
                                            src={cat.image_url ? (cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`) : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop'} 
                                            className="d-block w-100 h-100 object-fit-cover" 
                                            alt={cat.name} 
                                        />
                                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}></div>
                                    </div>
                                    
                                    {/* Banner Content */}
                                    <div className="carousel-caption d-flex flex-column align-items-start justify-content-center h-100 text-start px-md-5" style={{ left: '0', right: '0', bottom: '0', fontFamily: "'Inter', sans-serif" }}>
                                        <div className="mb-2">
                                            {cat.discount_percent > 0 && (
                                                <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm" style={{ fontSize: '0.8rem' }}>
                                                    {cat.discount_percent}% OFF NOW
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="display-4 fw-bold text-white mb-2 animate__animated animate__fadeInDown" style={{ lineHeight: '1.1' }}>
                                            {cat.name}
                                        </h1>
                                        <p className="text-white-50 mb-0 fs-5 fw-semibold animate__animated animate__fadeInUp animate__delay-1s" style={{ maxWidth: '500px' }}>
                                            {cat.description || `Discover the best selection of ${cat.name} products.`}
                                        </p>
                                        <div className="mt-4">
                                            <div className="d-flex align-items-center gap-2 text-white fw-bold">
                                                <span>Click to explore</span>
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {catalogues.length > 1 && (
                            <>
                                <button className="carousel-control-prev" type="button" data-bs-target="#catalogueCarousel" data-bs-slide="prev">
                                    <span className="material-symbols-outlined fs-4" style={{ color: 'var(--brand-green)' }}>chevron_left</span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#catalogueCarousel" data-bs-slide="next">
                                    <span className="material-symbols-outlined fs-4" style={{ color: 'var(--brand-green)' }}>chevron_right</span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Content Layout */}
                <div className="row g-4">
                    <div className="col-lg-3">
                        <Sidebar 
                            categories={categories} 
                            activeCategory={activeCategory} 
                            onCategoryChange={setActiveCategory} 
                            filters={filters}
                            onApplyFilters={handleApplyFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                            <div>
                                <h2 className="h4 fw-bold m-0 border-start border-4 border-success ps-3">{activeCategory} Products</h2>
                                <div className="ps-3 mt-1">
                                    <span className="text-muted small">We found <span className="text-success fw-bold">{totalItems}</span> items for you!</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-4">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small d-none d-md-block">Sort by:</span>
                                    <select 
                                        className="form-select form-select-sm border-0 bg-white shadow-sm rounded-pill px-3 py-2 cursor-pointer transition-all hover-lift" 
                                        style={{ width: '160px', fontSize: '0.85rem' }}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="name_asc">Name: A-Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Fetching fresh groceries...</p>
                            </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {products.map(p => (
                                    <div className="col" key={p.product_id}>
                                        <ProductCard 
                                            id={p.product_id}
                                            title={p.name}
                                            weight={p.unit || 'Each'}
                                            price={p.price}
                                            discount_percent={p.applied_discount}
                                            final_price={p.final_price}
                                            image={getProductImage(p.image_url)}
                                            onAddToCart={handleAddToCart} 
                                            navigate={navigate}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination 
                            totalItems={totalItems} 
                            itemsPerPage={itemsPerPage} 
                            currentPage={currentPage} 
                            onPageChange={setCurrentPage} 
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
