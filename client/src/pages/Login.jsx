import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { login } from '../services/auth';
import Toast from '../components/Toast';
import { BRANDING } from '../components/Branding';


const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { type, title, message }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        try {
            const res = await login({ email, password });

            // Store token and user
            localStorage.setItem('token', res.data.token);
            const user = res.data.user || { name: 'User', role: 'user' };
            localStorage.setItem('user', JSON.stringify(user));

            // Set flag to show welcome toast only once
            sessionStorage.setItem('isFirstLogin', 'true');

            // Redirect based on role or back to previous page
            if (location.state?.from) {
                navigate(location.state.from);
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Invalid email or password.';
            setToast({
                type: 'error',
                title: 'Login Failed',
                message: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    const RequiredAsterisk = () => <span className="text-danger ms-1">*</span>;

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Please enter your details to sign in to your account."
        >
            {/* Render Toast if it exists */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-100">
                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="form-label fw-bold text-secondary mb-2 small">Email Address<RequiredAsterisk /></label>
                        <input
                            type="email"
                            className="form-control py-2 rounded-3 border-0"
                            style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)' }}
                            placeholder="jhon@exqmple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label fw-bold text-secondary mb-0 small">Password<RequiredAsterisk /></label>
                            <a href="#" className="text-decoration-none small fw-bold" style={{ color: '#10B981' }}>Forgot password?</a>
                        </div>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control py-2 rounded-3 border-0"
                                style={{ opacity: 0.8, background: 'rgba(243, 244, 246, 0.4)', paddingRight: '3rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn text-white w-100 py-3 fw-bold rounded-3 mb-4 shadow-sm" style={{ backgroundColor: '#10B981' }} disabled={loading}>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : null}
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Footer - Register Link */}
                    <div className="text-center mb-5 pt-2">
                        <span className="text-muted small">Don't have an account?</span>
                        <Link to="/signup" className="text-decoration-none fw-bold small ms-1" style={{ color: '#10B981' }}>Register now</Link>
                    </div>

                    <footer className="text-center text-muted small mt-5 pt-3 pb-5 border-top">
                        © {new Date().getFullYear()} {BRANDING.name} - {BRANDING.fullName}. All rights reserved.
                    </footer>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;

