import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import Toast from './Toast';

const AuthModal = ({ isOpen, onClose, onSuccess, initialView = 'login' }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Shipping

    useEffect(() => {
        setIsLogin(initialView === 'login');
        setCurrentStep(1);
        setError(null);
        setSuccessMessage(null);
    }, [initialView, isOpen]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        cnic: '',
        phone_number: '',
        country_code: '+92',
        addressLine1: '',
        addressLine2: '',
        town: '',
        region: '',
        postcode: '',
        country: 'Pakistan'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const countryCodeMap = {
        'Pakistan': '+92',
        'United States': '+1',
        'United Kingdom': '+44',
        'Canada': '+1'
    };

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

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

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

    const handleClear = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            cnic: '',
            phone_number: '',
            country_code: '+92',
            addressLine1: '',
            addressLine2: '',
            town: '',
            region: '',
            postcode: '',
            country: 'Pakistan'
        });
        setError(null);
    };

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.cnic || !formData.phone_number) {
            setError('Please fill in all personal details.');
            return false;
        }
        const cnicDigits = formData.cnic.replace(/\D/g, '');
        if (cnicDigits.length !== 13) {
            setError('CNIC must be exactly 13 digits.');
            return false;
        }
        const phoneDigits = formData.phone_number.replace(/\s/g, '');
        if (phoneDigits.length !== 10) {
            setError('Phone number must have exactly 10 digits.');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        return true;
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError(null);
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const res = await login({ email: formData.email, password: formData.password });
                const { token, user } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                onSuccess(user);
                onClose();
            } else {
                // Register logic
                if (!formData.addressLine1 || !formData.town || !formData.region || !formData.postcode) {
                    setError('Please fill in all shipping details.');
                    setLoading(false);
                    return;
                }

                const phoneDigits = formData.phone_number.replace(/\s/g, '');
                const payload = {
                    ...formData,
                    phone_number: formData.country_code + phoneDigits,
                    address: `${formData.addressLine1} ${formData.addressLine2}`.trim()
                };

                await register(payload);
                setSuccessMessage('Account created successfully! You can now log in.');
                setIsLogin(true);
                setCurrentStep(1);
                // Clear some fields but keep email for convenience?
                setFormData(prev => ({ ...prev, password: '', cnic: '', phone_number: '' }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const RequiredAsterisk = () => <span className="text-danger ms-1">*</span>;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                zIndex: 1050,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={handleBackdropClick}
        >
            <style>{`
                .auth-modal-card {
                    width: 100%;
                    max-width: 550px;
                    background: #ffffff;
                    border-radius: 28px;
                    padding: 40px 48px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    animation: modalScaleUp 0.3s ease-out;
                    position: relative;
                }
                @keyframes modalScaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .close-modal-btn {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .close-modal-btn:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }
                .auth-modal-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 8px;
                    letter-spacing: -0.02em;
                }
                .auth-modal-subtitle {
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.5;
                    margin-bottom: 32px;
                }
                .form-group-custom {
                    margin-bottom: 24px;
                }
                .form-label-custom {
                    font-size: 14px;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 8px;
                    display: block;
                }
                .input-wrapper-custom {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon-custom {
                    position: absolute;
                    left: 16px;
                    color: #94a3b8;
                    font-size: 20px;
                }
                .input-custom {
                    width: 100%;
                    height: 52px;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 0 48px;
                    font-size: 15px;
                    color: #1e293b;
                    transition: all 0.2s;
                }
                .input-custom:focus {
                    background: #ffffff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
                    outline: none;
                }
                .password-toggle-custom {
                    position: absolute;
                    right: 16px;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 20px;
                    user-select: none;
                }
                .password-toggle-custom:hover {
                    color: #64748b;
                }
                .forgot-password-link {
                    float: right;
                    color: #10b981;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                }
                .auth-button-custom {
                    flex-grow: 1;
                    height: 52px;
                    background: #10b981;
                    color: #ffffff;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                }
                .auth-button-custom:hover:not(:disabled) {
                    background: #059669;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
                }
                .auth-button-custom:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-clear-custom {
                    height: 52px;
                    padding: 0 24px;
                    background: #f8fafc;
                    color: #64748b;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-clear-custom:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .auth-footer-text {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 14px;
                    color: #64748b;
                }
                .register-link {
                    color: #10b981;
                    font-weight: 700;
                    text-decoration: none;
                    margin-left: 4px;
                }
                .step-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .step-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    transition: all 0.3s;
                }
                .step-dot.active {
                    background: #10b981;
                    width: 24px;
                    border-radius: 4px;
                }
                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 16px;
                    transition: color 0.2s;
                    border: none;
                    background: none;
                    padding: 0;
                }
                .back-button:hover {
                    color: #1e293b;
                }
            `}</style>

            <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                {!isLogin && currentStep === 2 && (
                    <button className="back-button" onClick={() => setCurrentStep(1)}>
                        <span className="material-symbols-outlined fs-5">arrow_back</span>
                        Back to Personal Info
                    </button>
                )}

                <h2 className="auth-modal-title">{isLogin ? 'Welcome Back' : (currentStep === 1 ? 'Personal Info' : 'Shipping Info')}</h2>
                <p className="auth-modal-subtitle">
                    {isLogin
                        ? 'Please enter your details to sign in to your account.'
                        : (currentStep === 1
                            ? 'First, let us know who you are. This information will be used for your account.'
                            : 'Tell us where to send your orders. You can update this later in settings.')}
                </p>

                {!isLogin && (
                    <div className="step-indicator">
                        <div className={`step-dot ${currentStep === 1 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${currentStep === 2 ? 'active' : ''}`}></div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger border-0 rounded-3 small py-2 d-flex align-items-center gap-2 mb-4">
                        <span className="material-symbols-outlined fs-5">error</span>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success border-0 rounded-3 small py-2 d-flex align-items-center gap-2 mb-4">
                        <span className="material-symbols-outlined fs-5">check_circle</span>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={isLogin || currentStep === 2 ? handleSubmit : handleNext}>
                    {isLogin ? (
                        <>
                            <div className="form-group-custom">
                                <label className="form-label-custom">Email or Username<RequiredAsterisk /></label>
                                <div className="input-wrapper-custom">
                                    <span className="material-symbols-outlined input-icon-custom">alternate_email</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input-custom"
                                        placeholder="yourname@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-custom">
                                <div className="d-flex justify-content-between">
                                    <label className="form-label-custom">Password<RequiredAsterisk /></label>
                                    <a href="#" className="forgot-password-link" onClick={e => e.preventDefault()}>Forgot password?</a>
                                </div>
                                <div className="input-wrapper-custom">
                                    <span className="material-symbols-outlined input-icon-custom">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="input-custom"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="material-symbols-outlined password-toggle-custom"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        currentStep === 1 ? (
                            <>
                                <div className="form-group-custom">
                                    <label className="form-label-custom">Full Name<RequiredAsterisk /></label>
                                    <div className="input-wrapper-custom">
                                        <span className="material-symbols-outlined input-icon-custom">person</span>
                                        <input
                                            type="text"
                                            name="name"
                                            className="input-custom"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group-custom">
                                    <label className="form-label-custom">Email Address<RequiredAsterisk /></label>
                                    <div className="input-wrapper-custom">
                                        <span className="material-symbols-outlined input-icon-custom">alternate_email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="input-custom"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">CNIC<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">badge</span>
                                                <input
                                                    type="text"
                                                    name="cnic"
                                                    className="input-custom ps-5"
                                                    placeholder="XXXXX-XXXXXXX-X"
                                                    value={formData.cnic}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ paddingLeft: '48px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">Phone Number<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">call</span>
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    className="input-custom"
                                                    placeholder="3XX XXXXXXX"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group-custom">
                                    <label className="form-label-custom">Password<RequiredAsterisk /></label>
                                    <div className="input-wrapper-custom">
                                        <span className="material-symbols-outlined input-icon-custom">lock</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="input-custom"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span
                                            className="material-symbols-outlined password-toggle-custom"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group-custom">
                                    <label className="form-label-custom">Shipping Address<RequiredAsterisk /></label>
                                    <div className="input-wrapper-custom">
                                        <span className="material-symbols-outlined input-icon-custom">home</span>
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            className="input-custom"
                                            placeholder="House #, Street name"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group-custom">
                                    <label className="form-label-custom">Street Address Line 2</label>
                                    <div className="input-wrapper-custom">
                                        <span className="material-symbols-outlined input-icon-custom">apartment</span>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            className="input-custom"
                                            placeholder="Apartment, suite, etc. (optional)"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">Town / City<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">location_city</span>
                                                <input
                                                    type="text"
                                                    name="town"
                                                    className="input-custom"
                                                    placeholder="City"
                                                    value={formData.town}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">Region / State<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">map</span>
                                                <input
                                                    type="text"
                                                    name="region"
                                                    className="input-custom"
                                                    placeholder="Region"
                                                    value={formData.region}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">Postcode<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">mark_as_unread</span>
                                                <input
                                                    type="text"
                                                    name="postcode"
                                                    className="input-custom"
                                                    placeholder="Zip code"
                                                    value={formData.postcode}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group-custom">
                                            <label className="form-label-custom">Country<RequiredAsterisk /></label>
                                            <div className="input-wrapper-custom">
                                                <span className="material-symbols-outlined input-icon-custom">public</span>
                                                <select
                                                    name="country"
                                                    className="input-custom"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ appearance: 'none' }}
                                                >
                                                    <option value="Pakistan">Pakistan</option>
                                                    <option value="United States">United States</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="Canada">Canada</option>
                                                </select>
                                                <span className="material-symbols-outlined position-absolute end-0 me-3 text-muted pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    )}

                    <div className="d-flex gap-3 mt-4">
                        {!isLogin && (
                            <button
                                type="button"
                                className="btn-clear-custom"
                                onClick={handleClear}
                            >
                                Clear Form
                            </button>
                        )}
                        <button
                            type="submit"
                            className="auth-button-custom d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            {loading && <span className="spinner-border spinner-border-sm"></span>}
                            {isLogin ? 'Login' : (currentStep === 1 ? 'Next Step' : 'Create Account')}
                            {!isLogin && !loading && (
                                <span className="material-symbols-outlined fs-5">
                                    {currentStep === 1 ? 'arrow_forward' : 'check_circle'}
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="auth-footer-text">
                    {isLogin ? (
                        <>
                            Don't have an account?
                            <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); setIsLogin(false); setCurrentStep(1); setSuccessMessage(null); setError(null); }}>Register now</a>
                        </>
                    ) : (
                        <>
                            Already have an account?
                            <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); setIsLogin(true); setCurrentStep(1); setSuccessMessage(null); setError(null); }}>Login here</a>
                        </>
                    )}
                </div>

                <div className="auth-bottom-links d-flex justify-content-center gap-3 mt-4">
                    <a href="#" className="text-secondary small text-decoration-none">Terms of Service</a>
                    <a href="#" className="text-secondary small text-decoration-none">Privacy Policy</a>
                    <a href="#" className="text-secondary small text-decoration-none">Contact Support</a>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
