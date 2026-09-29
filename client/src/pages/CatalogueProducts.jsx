import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import Toast from '../components/Toast';
import { Logo, BRANDING } from '../components/Branding';
import { generateSlug } from '../helpers';

const getProductImage = (imgUrl) => {
    try {
        if (imgUrl) {
            const parsed = JSON.parse(imgUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0].startsWith('http') || parsed[0].startsWith('data:') ? parsed[0] : `http://localhost:5000${parsed[0]}`;
            }
        }
    } catch (e) {}
    return imgUrl ? (imgUrl.startsWith('http') || imgUrl.startsWith('data:') ? imgUrl : `http://localhost:5000${imgUrl}`) : '/images/placeholder.png';
};

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
        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden product-card-hover position-relative">
            {hasDiscount && (
                <div className="position-absolute top-0 end-0 m-3 z-3">
                    <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm" style={{ fontSize: '0.75rem' }}>
                        {discount_percent}% OFF
                    </span>
                </div>
            )}
            <div className="position-relative overflow-hidden" style={{ height: '190px', backgroundColor: '#f8fafc', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <img src={image} alt={title} className="w-100 h-100 object-fit-cover transition-transform" style={{ transition: 'transform 0.4s ease' }} />
                
                {/* Hover Overlay */}
                <div className="details-overlay" onClick={() => navigate(`/product/${generateSlug(title)}`)}>
                    <span className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined fs-5">visibility</span>
                        See Details
                    </span>
                </div>
            </div>
            <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
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
                <div className="mb-2">
                    {hasDiscount ? (
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-5" style={{ color: 'var(--brand-green)' }}>Rs. {final_price}</span>
                            <span className="text-muted text-decoration-line-through small">Rs. {price}</span>
                        </div>
                    ) : (
                        <span className="fw-bold fs-5" style={{ color: 'var(--brand-green)' }}>Rs. {price}</span>
                    )}
                </div>
                <p className="text-muted small mb-3">{weight}</p>
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

    useEffect(() => {
        if (filters) {
            setMinPrice(filters.minPrice);
            setMaxPrice(filters.maxPrice);
            setSortBy(filters.sortBy || 'featured');
        }
    }, [filters]);

    return (
    <div className="card border-0 shadow-sm rounded-4 px-3 py-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
        <h5 className="fw-bold mb-4 px-2 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">category</span>
            Catalogue Categories
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
        `}</style>

        <hr className="my-4 opacity-50" />
            
        <h5 className="fw-bold mb-3 px-2 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">payments</span>
            Filter by Price
        </h5>
        <div className="px-2">
            <div className="d-flex align-items-center gap-2 mb-3">
                <input type="number" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span className="text-muted">-</span>
                <input type="number" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label small fw-bold text-muted mb-1">Sort By</label>
                <select className="form-select form-select-sm rounded-3" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A-Z</option>
                </select>
            </div>
            <div className="d-flex flex-column gap-2">
                <button className="btn btn-success btn-sm w-100 fw-bold rounded-pill shadow-sm" onClick={() => onApplyFilters({ ...filters, minPrice, maxPrice, sortBy })}>
                    Apply Filters
                </button>
                <button className="btn btn-outline-danger btn-sm w-100 fw-bold rounded-pill shadow-sm" onClick={() => onResetFilters()}>
                    Reset Filter
                </button>
            </div>
        </div>
    </div>
    );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    if (itemsPerPage <= 0 || isNaN(itemsPerPage)) return null;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5 mb-4">
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
    );
};

const CatalogueProducts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [catalogue, setCatalogue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
    
    // Filtering states
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        inStock: false
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    useEffect(() => {
        const fetchCatalogueDetails = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/catalogues/${id}`);
                setCatalogue(res.data);
            } catch (err) {
                console.error("Error fetching catalogue products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogueDetails();
    }, [id]);

    const handleAddToCart = (product) => {
        if (!localStorage.getItem('token')) {
            setToast({ type: 'error', title: 'Login Required', message: 'Please login to add items to cart.' });
            return;
        }
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            let newCart = existing ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item) : [...prev, product];
            localStorage.setItem('cart', JSON.stringify(newCart));
            setToast({ type: 'success', title: 'Added', message: 'Product added to cart!' });
            return newCart;
        });
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        if (newFilters.sortBy) {
            setSortBy(newFilters.sortBy);
        }
    };
    const handleResetFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', inStock: false });
        setActiveCategory('All');
        setSearchQuery('');
        setSortBy('featured');
    };

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, filters, sortBy, itemsPerPage]);

    if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-success"></div><p className="mt-2 text-muted">Loading catalogue...</p></div>;
    if (!catalogue) return <div className="text-center py-5 mt-5"><h3>Catalogue not found</h3><button className="btn btn-success rounded-pill mt-3" onClick={() => navigate('/')}>Back Home</button></div>;

    // Filter products locally
    let filteredProducts = catalogue.products || [];
    if (activeCategory !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category_name === activeCategory);
    }
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.final_price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.final_price <= parseFloat(filters.maxPrice));
    }
    if (filters.inStock) {
        filteredProducts = filteredProducts.filter(p => p.stock_qty > 0);
    }
    
    // Sort
    if (sortBy === 'price_asc') filteredProducts.sort((a, b) => a.final_price - b.final_price);
    else if (sortBy === 'price_desc') filteredProducts.sort((a, b) => b.final_price - a.final_price);
    else if (sortBy === 'name_asc') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination slicing
    const totalItems = filteredProducts.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white min-vh-100">
            <Navbar 
                cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)} 
                user={user} 
                onLogout={() => { localStorage.clear(); setUser(null); navigate('/'); }} 
                navigate={navigate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateUser}
            />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            
            <div className="py-4 py-lg-5 mx-auto" style={{ width: '75%' }}>
                {/* Catalogue Banner */}
                <div className="mb-5 p-5 rounded-5 text-white position-relative overflow-hidden shadow-sm" 
                    style={{ 
                        background: catalogue.image_url 
                            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${catalogue.image_url.startsWith('http') ? catalogue.image_url : `http://localhost:5000${catalogue.image_url}`})`
                            : 'linear-gradient(135deg, #059669 0%, #10B981 100%)', 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '250px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                    <div className="position-relative z-index-1">
                        <div className="d-flex align-items-center flex-wrap gap-3 mb-2">
                            <h1 className="display-4 fw-black m-0 animate__animated animate__fadeInDown">{catalogue.name}</h1>
                            {catalogue.discount_percent > 0 && (
                                <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-lg animate__animated animate__pulse animate__infinite">
                                    UP TO {catalogue.discount_percent}% OFF
                                </span>
                            )}
                        </div>
                        <p className="lead opacity-90 fw-semibold animate__animated animate__fadeInUp" style={{ maxWidth: '600px' }}>
                            {catalogue.description || `Browse our exclusive collection of ${catalogue.name} products.`}
                        </p>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Sidebar */}
                    <div className="col-lg-3">
                        <Sidebar 
                            categories={catalogue.categories || []}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                            filters={filters}
                            onApplyFilters={handleApplyFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {/* Products Grid */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                            <div>
                                <h2 className="h4 fw-bold m-0 border-start border-4 border-success ps-3">{activeCategory === 'All' ? 'All Catalogue' : activeCategory} Products</h2>
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
                                        <option value="name_asc">Name: A-Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map(p => (
                                    <div className="col" key={p.product_id}>
                                        <ProductCard 
                                            id={p.product_id}
                                            title={p.name}
                                            price={p.price}
                                            discount_percent={p.applied_discount}
                                            final_price={p.final_price}
                                            weight={p.unit}
                                            image={getProductImage(p.image_url)}
                                            onAddToCart={handleAddToCart}
                                            navigate={navigate}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5 bg-light rounded-4 border border-dashed">
                                    <span className="material-symbols-outlined display-4 text-muted mb-3">search_off</span>
                                    <h4 className="text-muted">No products match your filters.</h4>
                                    <button className="btn btn-success btn-sm rounded-pill px-4 mt-2" onClick={handleResetFilters}>Clear All Filters</button>
                                </div>
                            )}
                        </div>

                        {/* Pagination & Show Entries */}
                        <div className="position-relative d-flex align-items-center justify-content-center mt-5 mb-4" style={{ minHeight: '60px' }}>
                            <Pagination 
                                totalItems={totalItems} 
                                itemsPerPage={itemsPerPage} 
                                currentPage={currentPage} 
                                onPageChange={setCurrentPage} 
                            />
                            <div className="position-absolute end-0 d-flex align-items-center gap-2 bg-white p-2 px-3 rounded-pill shadow-sm border" style={{ fontSize: '0.85rem' }}>
                                <span className="text-muted small">Show:</span>
                                <select 
                                    className="form-select form-select-sm border-0 bg-transparent shadow-none cursor-pointer" 
                                    style={{ width: '60px', fontSize: '0.85rem', fontWeight: 'bold' }}
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .details-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; cursor: pointer; z-index: 2; }
                .product-card-hover:hover .details-overlay { opacity: 1; background: rgba(16, 185, 129, 0.6); }
                .details-overlay span { background: var(--brand-green); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; transform: translateY(10px); transition: 0.3s; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); }
                .product-card-hover:hover .details-overlay span { transform: translateY(0); }
                .product-card-hover:hover img { transform: scale(1.1); }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default CatalogueProducts;

