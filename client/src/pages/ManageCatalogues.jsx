import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const CatalogueManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [catalogues, setCatalogues] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_ids: [],
        discount_percent: 0,
        is_active: 1
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [currentCatalogueId, setCurrentCatalogueId] = useState(null);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [catalogueToDelete, setCatalogueToDelete] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }
        setAdmin(user);
        fetchCatalogues();
        fetchAllCategories();
    }, [navigate, token]);

    const fetchAllCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setAllCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchCatalogues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/catalogues?view=admin');
            setCatalogues(res.data);
        } catch (error) {
            showToast('error', 'Error', 'Failed to fetch catalogues');
        }
    };

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => {
            const isSelected = prev.category_ids.includes(categoryId);
            return {
                ...prev,
                category_ids: isSelected
                    ? prev.category_ids.filter(id => id !== categoryId)
                    : [...prev.category_ids, categoryId]
            };
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (mode, catalogue = null) => {
        setModalMode(mode);
        if (mode === 'edit' && catalogue) {
            const mappedCategories = catalogue.categories ? catalogue.categories.map(c => c.category_id) : [];
            setFormData({
                name: catalogue.name,
                description: catalogue.description || '',
                category_ids: mappedCategories,
                discount_percent: catalogue.discount_percent || 0,
                is_active: catalogue.is_active
            });
            setImagePreview(catalogue.image_url);
            setCurrentCatalogueId(catalogue.catalogue_id);
        } else {
            setFormData({ name: '', description: '', category_ids: [], discount_percent: 0, is_active: 1 });
            setImageFile(null);
            setImagePreview('');
            setCurrentCatalogueId(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.category_ids.length === 0) {
            showToast('error', 'Validation Error', 'Please link at least one category');
            return;
        }

        if (modalMode === 'add' && !imageFile) {
            showToast('error', 'Validation Error', 'Please upload a catalogue thumbnail');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('discount_percent', formData.discount_percent);
        data.append('category_ids', JSON.stringify(formData.category_ids));
        data.append('is_active', formData.is_active);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            if (modalMode === 'add') {
                await axios.post('http://localhost:5000/api/catalogues', data, config);
                showToast('success', 'Success', 'Catalogue created');
            } else {
                await axios.put(`http://localhost:5000/api/catalogues/${currentCatalogueId}`, data, config);
                showToast('success', 'Success', 'Catalogue updated');
            }
            fetchCatalogues();
            handleCloseModal();
        } catch (error) {
            showToast('error', 'Error', error.response?.data?.message || 'Operation failed');
        }
    };

    const confirmDelete = (catalogue) => {
        setCatalogueToDelete(catalogue);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/catalogues/${catalogueToDelete.catalogue_id}`, config);
            showToast('success', 'Deleted', 'Catalogue removed');
            fetchCatalogues();
            setShowDeleteModal(false);
        } catch (error) {
            showToast('error', 'Error', 'Failed to delete');
        }
    };

    const filteredCatalogues = catalogues.filter(catalogue => {
        const matchesSearch = catalogue.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        if (activeTab === 'active') return catalogue.is_active === 1;
        if (activeTab === 'inactive') return catalogue.is_active === 0;
        return true;
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleStatus = async (catalogue) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const data = new FormData();
            data.append('name', catalogue.name);
            data.append('description', catalogue.description || '');
            data.append('discount_percent', catalogue.discount_percent || 0);
            data.append('category_ids', JSON.stringify(catalogue.categories?.map(c => c.category_id) || []));
            data.append('is_active', catalogue.is_active ? 0 : 1);
            
            await axios.put(`http://localhost:5000/api/catalogues/${catalogue.catalogue_id}`, data, config);
            showToast('success', 'Status Updated', `Catalogue is now ${!catalogue.is_active ? 'Active' : 'Inactive'}`);
            fetchCatalogues();
        } catch (error) {
            showToast('error', 'Update Failed', 'Could not change status');
        }
    };

    const sortedCatalogues = [...filteredCatalogues].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getCount = (tab) => {
        if (tab === 'all') return catalogues.length;
        if (tab === 'active') return catalogues.filter(c => c.is_active === 1).length;
        if (tab === 'inactive') return catalogues.filter(c => c.is_active === 0).length;
        return 0;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
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
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Manage Catalogues</h2>
                            <p className="text-muted fw-semibold mb-0">Group categories into collections.</p>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="search-container shadow-sm rounded-pill" style={{ width: '300px', background: '#fff' }}>
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search catalogues..."
                                    style={{ background: 'transparent', border: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-success p-3 rounded-4 fw-bold shadow-sm d-flex align-items-center gap-2" style={{ background: 'var(--admin-primary)', border: 'none' }} onClick={() => handleOpenModal('add')}>
                                <span className="material-symbols-outlined fs-5">add</span>
                                New Catalogue
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
                                onClick={() => setActiveTab(tab)}
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
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            CATALOGUE
                                            <span className="material-symbols-outlined fs-6 text-muted">
                                                {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                            </span>
                                        </div>
                                    </th>
                                    <th>Discount</th>
                                    <th>Linked Categories</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCatalogues.length > 0 ? (
                                    sortedCatalogues.map(cat => (
                                        <tr key={cat.catalogue_id}>
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-3">
                                                    {cat.image_url ? (
                                                        <img src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`} alt={cat.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="rounded-3 bg-light d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}><span className="material-symbols-outlined text-muted">image</span></div>
                                                    )}
                                                    <div>
                                                        <div className="text-dark">{cat.name}</div>
                                                        <div className="text-muted small fw-normal">{cat.product_count || 0} Products</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {cat.discount_percent > 0 ? (
                                                    <span className="admin-badge admin-badge-danger">{cat.discount_percent}% OFF</span>
                                                ) : (
                                                    <span className="text-muted small">None</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                                    {cat.categories?.map(c => c.name).join(', ') || 'No categories'}
                                                </div>
                                            </td>
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
                                    <tr><td colSpan="5" className="text-center py-5 text-muted fw-semibold">No catalogues found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-backdrop" onClick={handleCloseModal}>
                    <div className="admin-modal-content" style={{ maxWidth: '800px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-semibold mb-0">{modalMode === 'add' ? 'Add New Catalogue' : 'Edit Catalogue'}</h4>
                            <button className="btn-close shadow-none admin-btn-close-animate" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-md-7">
                                    <label className="small fw-semibold text-muted mb-2 d-block">CATALOGUE NAME <span className="text-danger">*</span></label>
                                    <input type="text" name="name" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-5">
                                    <label className="small fw-semibold text-muted mb-2 d-block">DISCOUNT (%) <span className="text-danger">*</span></label>
                                    <input type="number" name="discount_percent" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" value={formData.discount_percent} onChange={handleInputChange} min="0" max="100" required />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">CATALOGUE STATUS</label>
                                <div className="d-flex align-items-center gap-3 p-2 px-3 bg-light rounded-4">
                                    <div className="form-check form-switch mb-0">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            role="switch" 
                                            id="catalogueStatusSwitch"
                                            checked={formData.is_active === 1}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                            style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <label className="form-check-label fw-semibold ms-2" htmlFor="catalogueStatusSwitch">
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
                                <textarea name="description" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" rows="2" value={formData.description} onChange={handleInputChange} placeholder="Describe this collection..."></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-semibold text-muted mb-2 d-block">LINK CATEGORIES <span className="text-danger">*</span></label>
                                <div className="p-3 bg-light rounded-4 overflow-auto" style={{ maxHeight: '150px' }}>
                                    {allCategories.map(cat => (
                                        <div key={cat.category_id} className="form-check mb-2">
                                            <input className="form-check-input" type="checkbox" checked={formData.category_ids.includes(cat.category_id)} onChange={() => handleCategoryToggle(cat.category_id)} />
                                            <label className="form-check-label fw-semibold text-dark">{cat.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="small fw-semibold text-muted mb-2 d-block">CATALOGUE IMAGE <span className="text-danger">*</span></label>
                                <input type="file" className="form-control p-3 bg-light border-0 rounded-4 fw-semibold" onChange={handleFileChange} required={modalMode === 'add'} />
                                {imagePreview && <div className="mt-3 text-center"><img src={(imagePreview.startsWith('http') || imagePreview.startsWith('data:') || imagePreview.startsWith('blob:')) ? imagePreview : `http://localhost:5000${imagePreview}`} alt="Preview" style={{ height: 80, borderRadius: 12 }} /></div>}
                            </div>
                             <div className="d-flex gap-3 mt-2">
                                <button type="button" className="btn btn-light flex-grow-1 p-3 rounded-4 fw-semibold" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1 p-3 rounded-4 fw-semibold" style={{ background: 'var(--admin-primary)' }}>Save Changes</button>
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-3 mb-3"><span className="material-symbols-outlined text-danger" style={{ fontSize: 32 }}>warning</span></div>
                            <h4 className="fw-semibold mb-2">Delete Catalogue?</h4>
                            <p className="text-muted fw-semibold mb-0">Are you sure you want to delete <strong className="text-dark">"{catalogueToDelete?.name}"</strong>?</p>
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

export default CatalogueManagement;
