import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

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

const ManageProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'product_id', direction: 'asc' });
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        price: '',
        stock_qty: '',
        unit: '',
        category_id: '',
        discount_percent: 0,
        is_active: 1
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [currentProductId, setCurrentProductId] = useState(null);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }
        setAdmin(user);
        fetchCategories();
        fetchProducts();
    }, [navigate, token]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products?view=admin');
            setProducts(res.data.products || []);
        } catch (error) {
            showToast('error', 'Error', 'Failed to fetch products');
        }
    };

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewFiles([...newFiles, ...files]);
            const newPrevs = files.map(file => URL.createObjectURL(file));
            setNewPreviews([...newPreviews, ...newPrevs]);
        }
    };

    const handleOpenModal = (mode, product = null) => {
        setModalMode(mode);
        if (mode === 'edit' && product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                brand: product.brand || '',
                price: product.price || '',
                stock_qty: product.stock_qty || 0,
                unit: product.unit || '',
                category_id: product.category_id || '',
                discount_percent: product.discount_percent || 0,
                is_active: product.is_active
            });
            
            let imgs = [];
            try {
                imgs = product.image_url ? JSON.parse(product.image_url) : [];
                if (!Array.isArray(imgs)) imgs = product.image_url ? [product.image_url] : [];
            } catch (e) {
                imgs = product.image_url ? [product.image_url] : [];
            }
            setExistingImages(imgs);
            setNewFiles([]);
            setNewPreviews([]);
            setCurrentProductId(product.product_id);
        } else {
            setFormData({
                name: '', description: '', brand: '', price: '',
                stock_qty: '', unit: '', category_id: '',
                discount_percent: 0, is_active: 1
            });
            setExistingImages([]);
            setNewFiles([]);
            setNewPreviews([]);
            setCurrentProductId(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            
            // Append remaining images for edit
            if (modalMode === 'edit') {
                submitData.append('remaining_images', JSON.stringify(existingImages));
            }

            // Append new files
            newFiles.forEach(file => {
                submitData.append('images', file);
            });

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (modalMode === 'add') {
                await axios.post('http://localhost:5000/api/products', submitData, config);
                showToast('success', 'Success', 'Product added successfully');
            } else {
                await axios.put(`http://localhost:5000/api/products/${currentProductId}`, submitData, config);
                showToast('success', 'Success', 'Product updated successfully');
            }
            fetchProducts();
            handleCloseModal();
        } catch (error) {
            showToast('error', 'Error', error.response?.data?.message || 'Something went wrong');
        }
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${productToDelete.product_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('success', 'Deleted', 'Product removed from system');
            fetchProducts();
            setShowDeleteModal(false);
        } catch (error) {
            showToast('error', 'Error', 'Failed to delete product');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleStatus = async (product) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const data = new FormData();
            Object.keys(product).forEach(key => {
                if (key !== 'is_active' && product[key] !== null) {
                    data.append(key, product[key]);
                }
            });
            data.append('is_active', product.is_active ? 0 : 1);
            
            await axios.put(`http://localhost:5000/api/products/${product.product_id}`, data, config);
            showToast('success', 'Status Updated', `${product.name} is now ${!product.is_active ? 'Active' : 'Inactive'}`);
            fetchProducts();
        } catch (error) {
            showToast('error', 'Update Failed', 'Could not change status');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        if (activeTab === 'active') return product.is_active === 1;
        if (activeTab === 'inactive') return product.is_active === 0;
        if (activeTab === 'out_of_stock') return product.stock_qty <= 0;
        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getCount = (tab) => {
        if (tab === 'all') return products.length;
        if (tab === 'active') return products.filter(p => p.is_active === 1).length;
        if (tab === 'inactive') return products.filter(p => p.is_active === 0).length;
        if (tab === 'out_of_stock') return products.filter(p => p.stock_qty <= 0).length;
        return 0;
    };

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="admin-dashboard-container">
            {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
            <AdminSidebar />
            <main className="admin-main-content">
                <AdminHeader admin={admin} onLogout={handleLogout} />

                <div className="p-5">
                    <div className="d-flex justify-content-between align-items-center mb-5 animate-fade">
                        <div>
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Manage Products</h2>
                            <p className="text-muted fw-semibold mb-0">Monitor inventory, pricing, and stock levels.</p>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="search-container shadow-sm rounded-pill" style={{ width: '300px', background: '#fff' }}>
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search products, brands..."
                                    style={{ background: 'transparent', border: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            <button className="btn btn-success p-3 rounded-4 fw-bold shadow-sm d-flex align-items-center gap-2" style={{ background: 'var(--admin-primary)', border: 'none' }} onClick={() => handleOpenModal('add')}>
                                <span className="material-symbols-outlined fs-5">add</span>
                                Add Product
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs with Counts */}
                    <div className="d-flex border-bottom mb-4 overflow-auto scrollbar-hidden">
                        {['all', 'active', 'inactive', 'out_of_stock'].map(tab => (
                            <button
                                key={tab}
                                className={`btn border-0 py-3 px-4 fw-bold text-uppercase position-relative transition-all d-flex align-items-center gap-2 ${activeTab === tab ? 'text-success' : 'text-muted'}`}
                                style={{ fontSize: '11px', letterSpacing: '0.05em', minWidth: '150px' }}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            >
                                {tab.replace(/_/g, ' ')}
                                <span 
                                    className="badge rounded-pill fw-semibold ms-auto" 
                                    style={{ 
                                        fontSize: '10px', 
                                        padding: '4px 8px',
                                        background: tab === 'active' ? '#dcfce7' : tab === 'inactive' ? '#fee2e2' : tab === 'out_of_stock' ? '#fef9c3' : '#f1f5f9',
                                        color: tab === 'active' ? '#166534' : tab === 'inactive' ? '#991b1b' : tab === 'out_of_stock' ? '#854d0e' : '#475569'
                                    }}
                                >
                                    {getCount(tab)}
                                </span>
                                {activeTab === tab && <div className="position-absolute bottom-0 start-0 w-100 bg-success" style={{ height: '3px' }}></div>}
                            </button>
                        ))}
                    </div>

                    <div className="admin-table-container animate-fade">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('product_id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">ID <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'product_id' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">PRODUCT <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th>CATEGORY</th>
                                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">PRICE <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th>STOCK</th>
                                    <th>STATUS</th>
                                    <th className="text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map(prod => (
                                        <tr key={prod.product_id}>
                                            <td className="fw-bold text-muted">#{prod.product_id}</td>
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-3">
                                                    {prod.image_url ? (
                                                        <img src={getProductImage(prod.image_url)} alt={prod.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="rounded-3 bg-light d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}><span className="material-symbols-outlined text-muted">image</span></div>
                                                    )}
                                                    <div>
                                                        <div className="text-dark">{prod.name}</div>
                                                        {prod.brand && <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>{prod.brand.toUpperCase()}</small>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary small fw-semibold">{prod.category_name}</td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className={`fw-semibold ${prod.discount_percent > 0 ? 'text-muted text-decoration-line-through small' : 'text-dark'}`}>Rs. {prod.price}</span>
                                                    {prod.discount_percent > 0 && (
                                                        <span className="text-success fw-semibold">Rs. {Math.round(prod.price * (1 - prod.discount_percent / 100))}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`fw-bold ${prod.stock_qty <= 0 ? 'text-danger' : 'text-dark'}`}>
                                                    {prod.stock_qty} <small className="text-muted">{prod.unit}</small>
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`admin-badge ${prod.is_active ? 'admin-badge-success' : 'admin-badge-danger'}`} onClick={() => toggleStatus(prod)} style={{ cursor: 'pointer' }}>
                                                    {prod.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button className="btn btn-sm btn-light rounded-3 fw-bold d-inline-flex align-items-center gap-1" style={{ color: 'var(--admin-primary)', padding: '6px 12px' }} onClick={() => handleOpenModal('edit', prod)}>
                                                        <span className="material-symbols-outlined fs-6">edit</span> Edit
                                                    </button>
                                                    <button className="btn btn-sm btn-light rounded-3 fw-bold d-inline-flex align-items-center gap-1" style={{ color: '#ef4444', padding: '6px 12px' }} onClick={() => confirmDelete(prod)}>
                                                        <span className="material-symbols-outlined fs-6">delete</span> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted fw-semibold">No products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.length > 0 && (
                        <div className="position-relative d-flex align-items-center justify-content-center mt-5 animate-fade" style={{ minHeight: '60px' }}>
                            <div className="d-flex align-items-center gap-2">
                                <button className="admin-pagination-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><span className="material-symbols-outlined fs-5">chevron_left</span></button>
                                <div className="d-flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1} className={`admin-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                    ))}
                                </div>
                                <button className="admin-pagination-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><span className="material-symbols-outlined fs-5">chevron_right</span></button>
                            </div>
                            <div className="position-absolute end-0 d-flex align-items-center gap-3 bg-white p-2 px-4 rounded-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                                <span className="text-muted small fw-bold">SHOW</span>
                                <select className="form-select form-select-sm rounded-3 fw-bold border-0 bg-light shadow-none" style={{ width: '70px', cursor: 'pointer', height: '36px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                    <option value="25">25</option><option value="50">50</option><option value="100">100</option>
                                </select>
                                <span className="text-muted small fw-bold text-uppercase">ENTRIES</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .admin-pagination-btn { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #fff; border: none; border-radius: 16px; color: #64748b; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .admin-pagination-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); color: var(--admin-primary); }
                .admin-pagination-btn.active { background: var(--admin-primary); color: #fff; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
                .admin-pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
                .admin-btn-close-animate { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .admin-btn-close-animate:hover { transform: rotate(90deg); background-color: #fee2e2; border-radius: 8px; }
            `}</style>

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-backdrop" onClick={handleCloseModal}>
                    <div className="admin-modal-content" style={{ maxWidth: '800px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-semibold mb-0">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h4>
                            <button className="btn-close shadow-none admin-btn-close-animate" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-md-5">
                                    <label className="small fw-semibold text-muted mb-2 d-block">PRODUCT NAME <span className="text-danger">*</span></label>
                                    <input type="text" name="name" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="small fw-semibold text-muted mb-2 d-block">BRAND</label>
                                    <input type="text" name="brand" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.brand} onChange={handleInputChange} placeholder="e.g. Nestle" />
                                </div>
                                <div className="col-md-4">
                                    <label className="small fw-semibold text-muted mb-2 d-block">CATEGORY <span className="text-danger">*</span></label>
                                    <select name="category_id" className="form-select p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.category_id} onChange={handleInputChange} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-md-3">
                                    <label className="small fw-semibold text-muted mb-2 d-block">PRICE (Rs.) <span className="text-danger">*</span></label>
                                    <input type="number" name="price" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.price} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="small fw-semibold text-muted mb-2 d-block">STOCK QTY <span className="text-danger">*</span></label>
                                    <input type="number" name="stock_qty" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.stock_qty} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="small fw-semibold text-muted mb-2 d-block">UNIT <span className="text-danger">*</span></label>
                                    <input type="text" name="unit" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.unit} onChange={handleInputChange} placeholder="e.g. kg, pcs" />
                                </div>
                                <div className="col-md-3">
                                    <label className="small fw-semibold text-muted mb-2 d-block">DISCOUNT (%)</label>
                                    <input type="number" name="discount_percent" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.discount_percent} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">PRODUCT STATUS <span className="text-danger">*</span></label>
                                <div className="d-flex align-items-center gap-3 p-2 px-3 bg-light rounded-4">
                                    <div className="form-check form-switch mb-0">
                                        <input className="form-check-input" type="checkbox" role="switch" checked={formData.is_active === 1} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} style={{ width: '40px', height: '20px', cursor: 'pointer' }} />
                                        <label className="form-check-label fw-semibold ms-2">{formData.is_active === 1 ? 'Active' : 'Inactive'}</label>
                                    </div>
                                    <span className={`admin-badge ${formData.is_active === 1 ? 'admin-badge-success' : 'admin-badge-danger'} ms-auto`}>{formData.is_active === 1 ? 'Visible on Site' : 'Hidden from Site'}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">DESCRIPTION</label>
                                <textarea name="description" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" rows="2" value={formData.description} onChange={handleInputChange}></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="small fw-semibold text-muted mb-2 d-block">PRODUCT IMAGES <span className="text-danger">*</span></label>
                                <input type="file" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" onChange={handleFileChange} multiple required={modalMode === 'add' && existingImages.length === 0 && newFiles.length === 0} />
                                
                                <div className="mt-3 d-flex flex-wrap gap-3">
                                    {/* Existing Images */}
                                    {existingImages.map((img, index) => (
                                        <div key={`existing-${index}`} className="position-relative">
                                            <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt="Preview" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                                            <button type="button" className="btn-close position-absolute top-0 end-0 bg-white rounded-circle shadow-sm" style={{ padding: '4px', transform: 'translate(30%, -30%)', fontSize: '10px' }} onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}></button>
                                        </div>
                                    ))}
                                    
                                    {/* New Previews */}
                                    {newPreviews.map((preview, index) => (
                                        <div key={`new-${index}`} className="position-relative">
                                            <img src={preview} alt="Preview" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                                            <button type="button" className="btn-close position-absolute top-0 end-0 bg-white rounded-circle shadow-sm" style={{ padding: '4px', transform: 'translate(30%, -30%)', fontSize: '10px' }} onClick={() => {
                                                setNewPreviews(newPreviews.filter((_, i) => i !== index));
                                                setNewFiles(newFiles.filter((_, i) => i !== index));
                                            }}></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="d-flex gap-3">
                                <button type="button" className="btn btn-light flex-grow-1 p-3 rounded-4 fw-semibold" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1 p-3 rounded-4 fw-semibold" style={{ background: 'var(--admin-primary)', border: 'none' }}>{modalMode === 'add' ? 'Save Product' : 'Update Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-3 mb-3"><span className="material-symbols-outlined text-danger" style={{ fontSize: 32 }}>warning</span></div>
                            <h4 className="fw-semibold mb-2">Delete Product?</h4>
                            <p className="text-muted fw-semibold">Are you sure you want to delete <strong className="text-dark">"{productToDelete?.name}"</strong>?</p>
                        </div>
                        <div className="d-flex gap-3">
                            <button className="btn btn-light flex-grow-1 p-3 rounded-4 fw-bold" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1 p-3 rounded-4 fw-bold" onClick={handleDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
