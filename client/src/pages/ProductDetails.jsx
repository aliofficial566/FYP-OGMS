import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AuthModal from '../components/AuthModal';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import { generateSlug } from '../helpers';

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

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [authModal, setAuthModal] = useState({ isOpen: false, initialView: 'login', message: null });
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleUpdateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error("Error parsing cart from localStorage", e);
            return [];
        }
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(res.data);
                
                // Fetch related products
                const relatedRes = await axios.get(`http://localhost:5000/api/products`, {
                    params: res.data.category_name ? { category: res.data.category_name, limit: 5 } : { limit: 5 }
                });
                const productsList = relatedRes.data.products || relatedRes.data || [];
                setRelatedProducts(productsList.filter(p => p.product_id !== res.data.product_id).slice(0, 4));
            } catch (error) {
                console.error("Error fetching product details:", error);
                setToast({ type: 'error', title: 'Error', message: 'Failed to load product details.' });
            } finally {
                setLoading(false);
            }
        };

        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleMinus = () => { if (quantity > 1) setQuantity(prev => prev - 1); };
    const handlePlus = () => { setQuantity(prev => prev + 1); };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const handleAddToCart = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthModal({
                isOpen: true,
                initialView: 'login',
                message: 'Login Required to add the product in cart'
            });
            return;
        }

        const productToAdd = {
            id: product.product_id,
            title: product.name,
            price: product.price,
            discount_percent: product.applied_discount || 0,
            final_price: product.final_price || product.price,
            quantity: quantity,
            image: getProductImage(product.image_url)
        };

        setCartItems(prev => {
            const existing = prev.find(item => item.id === productToAdd.id);
            let newCart;
            if (existing) {
                newCart = prev.map(item =>
                    item.id === productToAdd.id ? { ...item, quantity: item.quantity + productToAdd.quantity } : item
                );
            } else {
                newCart = [...prev, productToAdd];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('cartUpdated'));
            setToast({
                type: 'success',
                title: 'Added to Cart',
                message: `${product.name} has been added to your cart.`
            });
            return newCart;
        });
    };

    const handleAddToCartRelated = (productToAdd) => {
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
            const existing = prev.find(item => item.id === productToAdd.id);
            let newCart;
            if (existing) {
                newCart = prev.map(item =>
                    item.id === productToAdd.id ? { ...item, quantity: item.quantity + productToAdd.quantity } : item
                );
            } else {
                newCart = [...prev, productToAdd];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('cartUpdated'));
            setToast({
                type: 'success',
                title: 'Added to Cart',
                message: `${productToAdd.title} has been added to your cart.`
            });
            return newCart;
        });
    };

    function getProductImage(imgUrl) {
        try {
            if (imgUrl) {
                const parsed = JSON.parse(imgUrl);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed[0].startsWith('http') || parsed[0].startsWith('data:') ? parsed[0] : `http://localhost:5000${parsed[0]}`;
                }
            }
        } catch (e) {}
        return imgUrl ? (imgUrl.startsWith('http') || imgUrl.startsWith('data:') ? imgUrl : `http://localhost:5000${imgUrl}`) : '/images/placeholder.png';
    }

    // Parse product images before early return to satisfy hooks rules
    const productImages = (() => {
        if (!product || !product.image_url) return ['/images/placeholder.png'];
        try {
            const parsed = JSON.parse(product.image_url);
            if (Array.isArray(parsed)) {
                return parsed.map(img => img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000${img}`);
            }
            return [product.image_url.startsWith('http') || product.image_url.startsWith('data:') ? product.image_url : `http://localhost:5000${product.image_url}`];
        } catch (e) {
            return [product.image_url.startsWith('http') || product.image_url.startsWith('data:') ? product.image_url : `http://localhost:5000${product.image_url}`];
        }
    })();

    // Automatic slider rotation (Must be called before early return)
    useEffect(() => {
        if (productImages.length > 1) {
            const interval = setInterval(() => {
                setActiveImageIdx(prev => (prev < productImages.length - 1 ? prev + 1 : 0));
            }, 3000); // Rotate every 3 seconds
            return () => clearInterval(interval);
        }
    }, [productImages.length]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h2 className="fw-bold">Product not found</h2>
                <button className="btn btn-success rounded-pill px-4 mt-3" onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    const productImage = productImages[0];

    return (
        <div className="bg-white min-vh-100 pb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <AuthModal
                {...authModal}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
                onSuccess={(u) => { setUser(u); setAuthModal({ ...authModal, isOpen: false }); }}
            />

            <Navbar 
                cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                onLogout={handleLogout}
                user={user}
                navigate={navigate}
                onOpenAuth={() => setAuthModal({ isOpen: true, initialView: 'login', message: null })}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateUser}
            />

            <div className="container py-5">
                {/* Breadcrumbs */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <div className="small fw-semibold d-flex align-items-center gap-2">
                        <Link to="/" className="text-decoration-none text-muted">Home</Link>
                        <span className="text-muted" style={{ fontSize: '10px' }}>&gt;</span>
                        <span className="text-dark">{product.name}</span>
                    </div>
                </nav>

                <div className="row g-4">
                    {/* Image Gallery Column */}
                    <div className="col-lg-6">
                        <div className="d-flex gap-3">
                            {/* Thumbnails Sidebar */}
                            {productImages.length > 1 && (
                                <div className="d-flex flex-column gap-2">
                                    {productImages.map((img, idx) => (
                                        <div 
                                            key={idx}
                                            className={`rounded-3 overflow-hidden cursor-pointer transition-all ${activeImageIdx === idx ? 'border border-2 border-dark' : 'border border-light opacity-75'}`}
                                            style={{ width: '70px', height: '70px' }}
                                            onClick={() => setActiveImageIdx(idx)}
                                        >
                                            <img src={img} alt="Thumbnail" className="w-100 h-100 object-fit-contain p-2" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main Image View */}
                            <div className="flex-grow-1 position-relative d-flex align-items-center justify-content-center p-4 main-image-container" style={{ minHeight: '450px' }}>
                                <img 
                                    src={productImages[activeImageIdx]} 
                                    alt={product.name} 
                                    className="img-fluid transition-all" 
                                    style={{ maxHeight: '400px', objectFit: 'contain' }} 
                                />
                                
                                {/* Slide Buttons (Show on hover if multiple images) */}
                                {productImages.length > 1 && (
                                    <div className="position-absolute w-100 px-3 d-flex justify-content-between align-items-center slide-buttons" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                                        <button className="btn btn-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                                                style={{ width: 40, height: 40, background: '#fff' }}
                                                onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : productImages.length - 1))}>
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button className="btn btn-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                                                style={{ width: 40, height: 40, background: '#fff' }}
                                                onClick={() => setActiveImageIdx(prev => (prev < productImages.length - 1 ? prev + 1 : 0))}>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info Column */}
                    <div className="col-lg-6">
                        <div className="ps-lg-4">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold">In Stock</span>
                                <span className="text-muted small fw-semibold">Brand: <span className="text-dark">{product.brand || 'Fresh Brand'}</span></span>
                            </div>

                            <h1 className="fw-bold text-dark mb-3">{product.name}</h1>
                            
                            <div className="d-flex align-items-center gap-3 mb-4">
                                {product.applied_discount > 0 ? (
                                    <>
                                        <h2 className="fw-bold text-success mb-0">Rs. {product.final_price}</h2>
                                        <span className="text-muted text-decoration-line-through">Rs. {product.price}</span>
                                        <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1 fw-bold">
                                            {product.applied_discount}% OFF
                                        </span>
                                    </>
                                ) : (
                                    <h2 className="fw-bold text-success mb-0">Rs. {product.price}</h2>
                                )}
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-2">Description</h6>
                                <p className="text-secondary small" style={{ lineHeight: '1.6' }}>
                                    {product.description || `${product.name} are fresh, naturally ripe, and packed with essential nutrients. Perfect for a healthy lifestyle, these are carefully selected to ensure the best quality and taste in every bite.`}
                                </p>
                            </div>

                            <hr className="my-4 opacity-10" />

                            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                                <div>
                                    <label className="form-label fw-bold text-dark mb-2 d-block small">Quantity</label>
                                    <div className="d-inline-flex align-items-center bg-white rounded-pill p-1 border">
                                        <button className="btn btn-sm btn-light rounded-circle shadow-none border-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }} onClick={handleMinus}>
                                            <span className="material-symbols-outlined fs-6">remove</span>
                                        </button>
                                        <span className="fw-bold px-3 small">{quantity}</span>
                                        <button className="btn btn-sm btn-light rounded-circle shadow-none border-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }} onClick={handlePlus}>
                                            <span className="material-symbols-outlined fs-6">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-grow-1 pt-sm-4">
                                    <button 
                                        className="btn btn-success w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all hover-lift"
                                        style={{ backgroundColor: '#10B981', border: 'none' }}
                                        onClick={handleAddToCart}
                                    >
                                        <span className="material-symbols-outlined fs-5">shopping_cart</span>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-5 pt-5 border-top">
                        <div className="mb-4">
                            <h4 className="fw-bold m-0 text-dark">You might also like</h4>
                        </div>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
                            {relatedProducts.map(p => (
                                <div className="col" key={p.product_id}>
                                    <ProductCard 
                                        id={p.product_id}
                                        title={p.name}
                                        weight={p.unit || 'Each'}
                                        price={p.price}
                                        discount_percent={p.applied_discount}
                                        final_price={p.final_price}
                                        image={getProductImage(p.image_url)}
                                        onAddToCart={handleAddToCartRelated} 
                                        navigate={navigate}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .slide-buttons {
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }
                .main-image-container:hover .slide-buttons {
                    opacity: 1;
                    pointer-events: auto;
                }
                .product-card-hover:hover .details-overlay {
                    opacity: 1;
                    background: rgba(16, 185, 129, 0.6);
                }
                
                .details-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(16, 185, 129, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: 0.3s;
                    cursor: pointer;
                    z-index: 2;
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

                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05) !important;
                }

                .breadcrumb-item + .breadcrumb-item::before {
                    content: '>';
                    font-size: 10px;
                    vertical-align: middle;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
