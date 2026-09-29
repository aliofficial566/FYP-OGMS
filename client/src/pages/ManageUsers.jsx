import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }

        setAdmin(user);
        fetchUsers();
    }, [navigate, token]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log('Fetching users from API...');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('API Response:', res.data);
            
            // Ensure we are setting an array
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else if (res.data && Array.isArray(res.data.data)) {
                setUsers(res.data.data);
            } else {
                console.error('Unexpected API response structure:', res.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Fetch Users Error:', error);
            showToast('error', 'Error', 'Failed to fetch user profiles');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3000);
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

    // Filter and Sort
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.city?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const paginatedUsers = sortedUsers.slice(
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
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>User Management</h2>
                            <p className="text-muted fw-semibold mb-0">Manage and monitor customer accounts across the platform.</p>
                        </div>

                        <div className="search-container shadow-sm rounded-pill" style={{ width: '400px', background: '#fff' }}>
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search name, email, city..."
                                style={{ background: 'transparent', border: 'none' }}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="admin-table-container animate-fade">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">UID <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">CUSTOMER <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'full_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                    <th>CONTACT INFO</th>
                                    <th>LOCATION</th>
                                    <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        <div className="d-flex align-items-center gap-2">JOINED DATE <span className="material-symbols-outlined fs-6 text-muted">{sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-success"></div></td></tr>
                                ) : paginatedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="fw-semibold text-muted">#UID-{user.id}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                {user.profile_image ? (
                                                    <img src={`http://localhost:5000${user.profile_image}`} alt={user.full_name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-semibold fs-5" style={{ width: 44, height: 44 }}>
                                                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="fw-semibold text-dark">{user.full_name || 'Anonymous User'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark small">{user.email}</span>
                                                <span className="text-muted small fw-bold d-flex align-items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>call</span>
                                                    {user.phone || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column" style={{ maxWidth: '200px' }}>
                                                <span className="fw-semibold text-dark small">{user.city || 'Unknown'}</span>
                                                <span className="text-muted small fw-bold text-truncate">{user.address || 'No address provided'}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted fw-semibold small">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                                {!loading && paginatedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-3"><span className="material-symbols-outlined text-muted fs-1">person_off</span></div>
                                            <h5 className="fw-semibold text-dark">No customers found</h5>
                                            <p className="text-muted fw-semibold">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Centered Pagination */}
                    {sortedUsers.length > 0 && (
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
            `}</style>
        </div>
    );
};

export default ManageUsers;
