import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [name, setName] = useState(user?.name || '');
    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.profile_image ? `http://localhost:5000${user.profile_image}` : null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setAddress(user.address || '');
            setPhone(user.phone || '');
            setImagePreview(user.profile_image ? `http://localhost:5000${user.profile_image}` : null);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password && password !== confirmPassword) {
            setToast({ type: 'error', title: 'Error', message: 'Passwords do not match!' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('full_name', name);
        if (user.role !== 'admin') {
            formData.append('address', address);
            formData.append('phone', phone);
        }
        if (password) formData.append('password', password);
        if (image) formData.append('profile_image', image);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setToast({ type: 'success', title: 'Success', message: 'Profile updated successfully!' });
                onUpdate(res.data.user);
                setTimeout(onClose, 1500);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setToast({ 
                type: 'error', 
                title: 'Error', 
                message: error.response?.data?.message || 'Failed to update profile.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }} onClick={onClose}>
            <div className="bg-white rounded-5 shadow-lg overflow-hidden animate__animated animate__zoomIn animate__faster" 
                 style={{ width: '100%', maxWidth: '620px', fontFamily: "'Inter', sans-serif" }}
                 onClick={e => e.stopPropagation()}>
                
                {toast && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 3000 }}>
                        <Toast {...toast} onClose={() => setToast(null)} />
                    </div>
                )}

                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h5 className="fw-black mb-0 text-dark">Edit Profile</h5>
                    <button className="btn btn-light rounded-circle p-1 d-flex" onClick={onClose}>
                        <span className="material-symbols-outlined fs-5">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                            <div className="rounded-circle overflow-hidden border border-4 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" 
                                 style={{ width: '100px', height: '100px' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <span className="material-symbols-outlined display-4 text-muted">account_circle</span>
                                )}
                            </div>
                            <label className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-2 shadow-sm cursor-pointer hover-scale" style={{ cursor: 'pointer' }}>
                                <span className="material-symbols-outlined fs-6 d-block">photo_camera</span>
                                <input type="file" className="d-none" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="small text-muted mt-2 mb-0">Update your profile picture</p>
                    </div>

                    <div className="mb-3">
                        <label className="small fw-bold text-muted mb-1">FULL NAME</label>
                        <div className="input-group bg-light rounded-4 overflow-hidden border-0">
                            <span className="input-group-text bg-transparent border-0 text-muted">
                                <span className="material-symbols-outlined fs-5">person</span>
                            </span>
                            <input 
                                type="text" 
                                className="form-control bg-transparent border-0 py-2 ps-0 shadow-none" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    {user?.role !== 'admin' && (
                        <>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-1">CURRENT ADDRESS</label>
                                <div className="input-group bg-light rounded-4 overflow-hidden border-0">
                                    <span className="input-group-text bg-transparent border-0 text-muted">
                                        <span className="material-symbols-outlined fs-5">location_on</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-transparent border-0 py-2 ps-0 shadow-none" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter your current address"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-1">PHONE NUMBER</label>
                                <div className="input-group bg-light rounded-4 overflow-hidden border-0">
                                    <span className="input-group-text bg-transparent border-0 text-muted">
                                        <span className="material-symbols-outlined fs-5">call</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-transparent border-0 py-2 ps-0 shadow-none" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mb-3">
                        <label className="small fw-bold text-muted mb-1">NEW PASSWORD (OPTIONAL)</label>
                        <div className="input-group bg-light rounded-4 overflow-hidden border-0">
                            <span className="input-group-text bg-transparent border-0 text-muted">
                                <span className="material-symbols-outlined fs-5">lock</span>
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control bg-transparent border-0 py-2 ps-0 shadow-none" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                            <span className="input-group-text bg-transparent border-0 text-muted" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                                <span className="material-symbols-outlined fs-5">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="small fw-bold text-muted mb-1">CONFIRM PASSWORD</label>
                        <div className="input-group bg-light rounded-4 overflow-hidden border-0">
                            <span className="input-group-text bg-transparent border-0 text-muted">
                                <span className="material-symbols-outlined fs-5">lock_reset</span>
                            </span>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="form-control bg-transparent border-0 py-2 ps-0 shadow-none" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                            <span className="input-group-text bg-transparent border-0 text-muted" style={{ cursor: 'pointer' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <span className="material-symbols-outlined fs-5">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                            </span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-success w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined fs-5">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
