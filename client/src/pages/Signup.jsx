import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import AuthLayout from '../components/AuthLayout';
import Toast from '../components/Toast';

const Signup = () => {
    const navigate = useNavigate();

    const countryCodeMap = {
        'Pakistan': '+92',
        'United States': '+1',
        'United Kingdom': '+44',
        'Canada': '+1'
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        cnic: '',
        email: '',
        phone_number: '',
        country_code: '+92',
        password: '',
        addressLine1: '',
        addressLine2: '',
        town: '',
        region: '',
        postcode: '',
        country: 'Pakistan'
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState(null); // { type, title, message }

    // Password Validation Rules
    const passwordRequirements = useMemo(() => [
        { label: 'Minimum 8 characters', regex: /.{8,}/ },
        { label: 'One uppercase letter', regex: /[A-Z]/ },
        { label: 'One lowercase letter', regex: /[a-z]/ },
        { label: 'One digit', regex: /[0-9]/ },
        { label: 'One special character', regex: /[^A-Za-z0-9]/ },
    ], []);

    const checkRequirement = (regex) => regex.test(formData.password);

    // Format CNIC: XXXXX-XXXXXXX-X
    const formatCNIC = (val) => {
        const digits = val.replace(/\D/g, '').substring(0, 13);
        let formatted = '';
        if (digits.length > 0) {
            formatted += digits.substring(0, 5);
            if (digits.length > 5) {
                formatted += '-' + digits.substring(5, 12);
                if (digits.length > 12) {
                    formatted += '-' + digits.substring(12, 13);
                }
            }
        }
        return formatted;
    };

    // Format Phone: 309 621 9566
    const formatPhone = (val) => {
        const digits = val.replace(/\D/g, '').substring(0, 10);
        let formatted = '';
        if (digits.length > 0) {
            formatted += digits.substring(0, 3);
            if (digits.length > 3) {
                formatted += ' ' + digits.substring(3, 6);
                if (digits.length > 6) {
                    formatted += ' ' + digits.substring(6, 10);
                }
            }
        }
        return formatted;
    };

    // Handle Input Change
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === 'cnic') value = formatCNIC(value);
        if (name === 'phone_number') value = formatPhone(value);

        if (name === 'country') {
            const newCode = countryCodeMap[value] || '+1';
            setFormData(prev => ({ ...prev, [name]: value, country_code: newCode }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle Clear All
    const handleClear = () => {
        setFormData({
            name: '',
            cnic: '',
            email: '',
            phone_number: '',
            country_code: '+92',
            password: '',
            addressLine1: '',
            addressLine2: '',
            town: '',
            region: '',
            postcode: '',
            country: 'Pakistan'
        });
        setToast(null);
    };

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setToast(null);

        // Final Validations
        const cnicDigits = formData.cnic.replace(/\D/g, '');
        if (cnicDigits.length !== 13) {
            setToast({ type: 'error', title: 'Validation Error', message: 'CNIC must be exactly 13 digits.' });
            return;
        }

        const phoneDigits = formData.phone_number.replace(/\s/g, '');
        if (phoneDigits.length !== 10) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Phone number must have exactly 10 digits.' });
            return;
        }

        const allPasswordRequirementsMet = passwordRequirements.every(req => req.regex.test(formData.password));
        if (!allPasswordRequirementsMet) {
            setToast({ type: 'error', title: 'Validation Error', message: 'Please fulfill all password requirements.' });
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            phone_number: formData.country_code + phoneDigits,
            address: `${formData.addressLine1} ${formData.addressLine2}`.trim()
        };

        try {
            await register(payload);

            // Start countdown
            setToast({ type: 'success', title: 'Account Created!', message: 'Redirecting to login in 4...' });

            setTimeout(() => {
                setToast(prev => prev ? { ...prev, message: 'Redirecting to login in 3...' } : null);
            }, 1000);

            setTimeout(() => {
                setToast(prev => prev ? { ...prev, message: 'Redirecting to login in 2...' } : null);
            }, 2000);

            setTimeout(() => {
                setToast(prev => prev ? { ...prev, message: 'Redirecting to login in 1...' } : null);
            }, 3000);

            setTimeout(() => {
                navigate('/login', { state: { from: '/' } });
            }, 4000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            setToast({ type: 'error', title: 'Error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const RequiredAsterisk = () => <span className="text-danger ms-1">*</span>;

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Please fill in your details to get started."
        >
            {/* Success/Error Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    duration={6000}
                    onClose={() => setToast(null)}
                />
            )}

            <form onSubmit={handleSubmit}>
                {/* Personal Info Section */}
                <div className="mb-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <h4 className="fw-bold text-dark m-0 small text-uppercase ls-wide">Personal Information</h4>
                        <div className="flex-grow-1 border-bottom" style={{ borderColor: '#10B981', borderBottomWidth: '2px', opacity: 0.2 }}></div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Full Name<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="jhon doe" type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">CNIC (13 Digits)<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="12345-1234567-1" type="text" name="cnic" value={formData.cnic} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Email<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="jhon@exqmple.com" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Phone Number<RequiredAsterisk /></label>
                            <div className="input-group">
                                <select
                                    className="input-group-text border-0 rounded-start-3 fw-bold text-secondary px-2"
                                    style={{ fontSize: '0.85rem', width: '70px', cursor: 'pointer', appearance: 'none', textAlign: 'center', opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }}
                                    name="country_code"
                                    value={formData.country_code}
                                    onChange={handleChange}
                                >
                                    <option value="+92">+92</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                </select>
                                <input
                                    className="form-control rounded-end-3 py-2 border-0 px-3"
                                    style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }}
                                    placeholder="300 1234567"
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Password<RequiredAsterisk /></label>
                        <div className="position-relative">
                            <input
                                className="form-control rounded-3 py-2 border-0 px-3"
                                style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)', paddingRight: '2.5rem' }}
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="material-symbols-outlined position-absolute end-0 top-50 translate-middle-y me-3 text-secondary cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer', fontSize: '20px' }}
                            >
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </div>

                        {/* Password Strength Real-time Indicators */}
                        <div className="mt-3 p-3 rounded-3 bg-light border-0">
                            <div className="row g-2">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="col-6 col-md-4 d-flex align-items-center gap-2">
                                        <span className={`material-symbols-outlined fs-6 ${checkRequirement(req.regex) ? 'text-success' : 'text-muted'}`}>
                                            {checkRequirement(req.regex) ? 'check_circle' : 'circle'}
                                        </span>
                                        <span className={`x-small ${checkRequirement(req.regex) ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="mb-5 border-top pt-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <h4 className="fw-bold text-dark m-0 small text-uppercase ls-wide">Shipping Address</h4>
                        <div className="flex-grow-1 border-bottom" style={{ borderColor: '#10B981', borderBottomWidth: '2px', opacity: 0.2 }}></div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Street Address Line 1<RequiredAsterisk /></label>
                        <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="House #, Street name" type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Street Address Line 2 (Optional)</label>
                        <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="Apartment, suite, unit, etc." type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Town / City<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="City name" type="text" name="town" value={formData.town} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Region / State<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="Province / State" type="text" name="region" value={formData.region} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Postcode / ZIP<RequiredAsterisk /></label>
                            <input className="form-control rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} placeholder="00000" type="text" name="postcode" value={formData.postcode} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Country<RequiredAsterisk /></label>
                            <select className="form-select rounded-3 py-2 border-0 px-3" style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }} name="country" value={formData.country} onChange={handleChange} required>
                                <option value="Pakistan">Pakistan</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Canada">Canada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="form-check mb-4 custom-checkbox">
                    <input id="terms" type="checkbox" className="form-check-input mt-1" required />
                    <label htmlFor="terms" className="form-check-label small text-muted ms-2">
                        I agree to the <a href="#" className="fw-bold text-decoration-none" style={{ color: '#10B981' }}>Terms and Conditions</a> and <a href="#" className="fw-bold text-decoration-none" style={{ color: '#10B981' }}>Privacy Policy</a>.
                    </label>
                </div>

                {/* Actions */}
                <div className="row g-3 pt-2">
                    <div className="col-4">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="btn py-3 fw-bold text-secondary rounded-3 w-100 border shadow-sm transition-all hover-opacity bg-white"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="col-8">
                        <button
                            className="btn py-3 fw-bold text-white rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
                            style={{ backgroundColor: '#10B981' }}
                            type="submit"
                            disabled={loading}
                        >
                            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
                <div className="text-center small py-3">
                    <span className="text-muted">Already have an account?</span>
                    <Link to="/login" className="fw-bold text-decoration-none ms-2 hover-opacity" style={{ color: '#10B981' }}>
                        Back to Login
                    </Link>
                </div>

                <footer className="text-center text-muted small mt-5 pt-3 pb-5 border-top">
                    © 2024 OGMS - Online Grocery Management System. All rights reserved.
                </footer>
            </form>
        </AuthLayout>
    );
};

export default Signup;
