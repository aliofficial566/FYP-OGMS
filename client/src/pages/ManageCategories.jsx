import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const ManageCategories = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [categories, setCategories] = useState([]);
    const [catalogues, setCatalogues] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'category_id', direction: 'asc' });
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
        catalogue_id: '',
        is_active: 1
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }
        setAdmin(user);
        fetchCategories();
        fetchCatalogues();
    }, [navigate, token]);

    const fetchCatalogues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/catalogues');
            setCatalogues(res.data);
        } catch (error) {
            console.error('Failed to fetch catalogues', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories?view=admin');
            setCategories(res.data);
        } catch (error) {
            showToast('error', 'Error', 'Failed to fetch categories');
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
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (mode, category = null) => {
        setModalMode(mode);
        if (mode === 'edit' && category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                catalogue_id: category.catalogue_id || '',
                is_active: category.is_active
            });
            setImageFile(null);
            setImagePreview(category.image_url || '');
            setCurrentCategoryId(category.category_id);
        } else {
            setFormData({ name: '', description: '', catalogue_id: '', is_active: 1 });
            setImageFile(null);
            setImagePreview('');
            setCurrentCategoryId(null);
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
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('is_active', formData.is_active);
            if (formData.catalogue_id) {
                submitData.append('catalogue_id', formData.catalogue_id);
            }
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (modalMode === 'add') {
                await axios.post('http://localhost:5000/api/categories', submitData, config);
                showToast('success', 'Success', 'Category added successfully');
            } else {
                await axios.put(`http://localhost:5000/api/categories/${currentCategoryId}`, submitData, config);
                showToast('success', 'Success', 'Category updated successfully');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save category';
            showToast('error', 'Error', msg);
        }
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${categoryToDelete.category_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('success', 'Success', 'Category deleted successfully');
            setShowDeleteModal(false);
            fetchCategories();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete category';
            showToast('error', 'Error', msg);
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

    const toggleStatus = async (category) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const data = new FormData();
            // Only send name and the new status to avoid overwriting other fields like description
            data.append('name', category.name);
            data.append('is_active', category.is_active ? 0 : 1);
            
            await axios.put(`http://localhost:5000/api/categories/${category.category_id}`, data, config);
            showToast('success', 'Status Updated', `Category is now ${!category.is_active ? 'Active' : 'Inactive'}`);
            fetchCategories();
        } catch (error) {
            console.error('Status toggle failed:', error);
            showToast('error', 'Update Failed', 'Could not change status');
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        if (activeTab === 'active') return category.is_active === 1;
        if (activeTab === 'inactive') return category.is_active === 0;
        return true;
    });

    const sortedCategories = [...filteredCategories].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getCount = (tab) => {
        if (tab === 'all') return categories.length;
        if (tab === 'active') return categories.filter(c => c.is_active === 1).length;
        if (tab === 'inactive') return categories.filter(c => c.is_active === 0).length;
        return 0;
    };

    // Pagination Logic
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    const paginatedCategories = sortedCategories.slice(
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
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Manage Categories</h2>
                            <p className="text-muted fw-semibold mb-0">Organize your store's product categories.</p>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="search-container shadow-sm rounded-pill" style={{ width: '300px', background: '#fff' }}>
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search categories..."
                                    style={{ background: 'transparent', border: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            <button className="btn btn-success p-3 rounded-4 fw-bold shadow-sm d-flex align-items-center gap-2" style={{ background: 'var(--admin-primary)', border: 'none' }} onClick={() => handleOpenModal('add')}>
                                <span className="material-symbols-outlined fs-5">add</span>
                                Add Category
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs with Counts */}
                    <div className="d-flex border-bottom mb-4 overflow-auto scrollbar-hidden">
                        {['all', 'active', 'inactive'].map(tab => (
                            <button
                                key={tab}
                                className={`btn border-0 py-3 px-4 fw-bold text-uppercase position-relative transition-all d-flex align-items-center gap-2 ${activeTab === tab ? 'text-success' : 'text-muted'}`}
                                style={{ fontSize: '11px', letterSpacing: '0.05em', minWidth: '150px' }}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            >
                                {tab}
                                <span 
                                    className="badge rounded-pill fw-black ms-auto" 
                                    style={{ 
                                        fontSize: '10px', 
                                        padding: '4px 8px',
                                        background: tab === 'active' ? '#dcfce7' : tab === 'inactive' ? '#fee2e2' : '#f1f5f9',
                                        color: tab === 'active' ? '#166534' : tab === 'inactive' ? '#991b1b' : '#475569'
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
                                    <th onClick={() => handleSort('category_id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            ID
                                            <span className="material-symbols-outlined fs-6 text-muted">
                                                {sortConfig.key === 'category_id' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                            </span>
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            NAME
                                            <span className="material-symbols-outlined fs-6 text-muted">
                                                {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                            </span>
                                        </div>
                                    </th>
                                    <th>DESCRIPTION</th>
                                    <th>STATUS</th>
                                    <th className="text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCategories.length > 0 ? (
                                    paginatedCategories.map(cat => (
                                        <tr key={cat.category_id}>
                                            <td className="fw-bold text-muted">#{cat.category_id}</td>
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-3">
                                                    {cat.image_url ? (
                                                        <img src={(cat.image_url.startsWith('http') || cat.image_url.startsWith('data:')) ? cat.image_url : `http://localhost:5000${cat.image_url}`} alt={cat.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="rounded-3 bg-light d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}><span className="material-symbols-outlined text-muted">image</span></div>
                                                    )}
                                                    <span className="text-dark">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-secondary small">{cat.description || 'No description provided'}</td>
                                            <td>
                                                <span 
                                                    className={`admin-badge ${cat.is_active ? 'admin-badge-success' : 'admin-badge-danger'}`}
                                                    onClick={() => toggleStatus(cat)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Click to toggle status"
                                                >
                                                    {cat.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button className="btn btn-sm btn-light rounded-3 fw-bold d-inline-flex align-items-center gap-1" style={{ color: 'var(--admin-primary)', padding: '6px 12px' }} onClick={() => handleOpenModal('edit', cat)}>
                                                        <span className="material-symbols-outlined fs-6">edit</span>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-sm btn-light rounded-3 fw-bold d-inline-flex align-items-center gap-1" style={{ color: '#ef4444', padding: '6px 12px' }} onClick={() => confirmDelete(cat)}>
                                                        <span className="material-symbols-outlined fs-6">delete</span>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted fw-semibold">No categories found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {categories.length > 0 && (
                        <div className="position-relative d-flex align-items-center justify-content-center mt-5 animate-fade" style={{ minHeight: '60px' }}>
                            {/* Center: Page Numbers */}
                            <div className="d-flex align-items-center gap-2">
                                <button 
                                    className="admin-pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    <span className="material-symbols-outlined fs-5">chevron_left</span>
                                </button>
                                
                                <div className="d-flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`admin-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    className="admin-pagination-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    <span className="material-symbols-outlined fs-5">chevron_right</span>
                                </button>
                            </div>

                            {/* Right: Entries Dropdown */}
                            <div className="position-absolute end-0 d-flex align-items-center gap-3 bg-white p-2 px-4 rounded-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                                <span className="text-muted small fw-bold">SHOW</span>
                                <select 
                                    className="form-select form-select-sm rounded-3 fw-bold border-0 bg-light shadow-none" 
                                    style={{ width: '70px', cursor: 'pointer', height: '36px' }}
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-muted small fw-bold text-uppercase">
                                    ENTRIES
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .admin-pagination-btn {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    border: none;
                    border-radius: 16px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 1.1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .admin-pagination-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                    color: var(--admin-primary);
                }
                .admin-pagination-btn.active {
                    background: var(--admin-primary);
                    color: #fff;
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
                }
                .admin-pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    box-shadow: none;
                }
            `}</style>

            {showModal && (
                <div className="admin-modal-backdrop" onClick={handleCloseModal}>
                    <div className="admin-modal-content" style={{ maxWidth: '800px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-semibold mb-0">{modalMode === 'add' ? 'Add New Category' : 'Edit Category'}</h4>
                            <button className="btn-close shadow-none admin-btn-close-animate" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-md-7">
                                    <label className="small fw-semibold text-muted mb-2 d-block">CATEGORY NAME <span className="text-danger">*</span></label>
                                    <input type="text" name="name" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Fresh Fruits" />
                                </div>
                                <div className="col-md-5">
                                    <label className="small fw-semibold text-muted mb-2 d-block">LINK CATALOGUE</label>
                                    <select name="catalogue_id" className="form-select p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.catalogue_id} onChange={handleInputChange}>
                                        <option value="">No Catalogue</option>
                                        {catalogues.map(cat => (
                                            <option key={cat.catalogue_id} value={cat.catalogue_id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">CATEGORY STATUS</label>
                                <div className="d-flex align-items-center gap-3 p-2 px-3 bg-light rounded-4">
                                    <div className="form-check form-switch mb-0">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            role="switch" 
                                            id="categoryStatusSwitch"
                                            checked={formData.is_active === 1}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                            style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <label className="form-check-label fw-semibold ms-2" htmlFor="categoryStatusSwitch">
                                            {formData.is_active === 1 ? 'Active' : 'Inactive'}
                                        </label>
                                    </div>
                                    <span className={`admin-badge ${formData.is_active === 1 ? 'admin-badge-success' : 'admin-badge-danger'} ms-auto`}>
                                        {formData.is_active === 1 ? 'Visible on Site' : 'Hidden from Site'}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">DESCRIPTION</label>
                                <textarea name="description" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" rows="2" value={formData.description} onChange={handleInputChange} placeholder="Briefly describe this category..."></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="small fw-semibold text-muted mb-2 d-block">CATEGORY IMAGE <span className="text-danger">*</span></label>
                                <input type="file" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" onChange={handleFileChange} required={modalMode === 'add'} />
                                {imagePreview && (
                                    <div className="mt-3 text-center bg-white p-2 rounded-4 border">
                                        <img src={(imagePreview.startsWith('http') || imagePreview.startsWith('data:') || imagePreview.startsWith('blob:')) ? imagePreview : `http://localhost:5000${imagePreview}`} alt="Preview" style={{ height: 100, borderRadius: 12, objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-3 mt-2">
                                <button type="button" className="btn btn-light flex-grow-1 p-3 rounded-4 fw-semibold" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1 p-3 rounded-4 fw-semibold" style={{ background: 'var(--admin-primary)', border: 'none' }}>
                                    {modalMode === 'add' ? 'Save Category' : 'Update Category'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <style>{`
                        .admin-btn-close-animate {
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .admin-btn-close-animate:hover {
                            transform: rotate(90deg);
                            background-color: #fee2e2;
                            border-radius: 8px;
                        }
                    `}</style>
                </div>
            )}

            {showDeleteModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-3 mb-3">
                                <span className="material-symbols-outlined text-danger" style={{ fontSize: 32 }}>warning</span>
                            </div>
                            <h4 className="fw-semibold mb-2">Delete Category?</h4>
                            <p className="text-muted fw-semibold">Are you sure you want to delete <strong className="text-dark">"{categoryToDelete?.name}"</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="d-flex gap-3">
                            <button className="btn btn-light flex-grow-1 p-3 rounded-4 fw-semibold" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1 p-3 rounded-4 fw-semibold" onClick={handleDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
