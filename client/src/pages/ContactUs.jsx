import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const ContactUs = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setToast({
                type: 'success',
                title: 'Message Sent!',
                message: 'Thank you for reaching out. We will get back to you soon.'
            });
            setFormData({ name: '', email: '', phone: '', message: '' });
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const RequiredAsterisk = () => <span className="text-danger ms-1">*</span>;

    return (
        <div className="contact-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <style>{`
                .contact-header {
                    background: linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%);
                    padding: 100px 0 60px;
                    text-align: center;
                }
                .contact-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .contact-subtitle {
                    font-size: 1.125rem;
                    color: #374151;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                .contact-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 40px 20px 100px;
                }
                .info-card {
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 40px;
                    height: 100%;
                }
                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .icon-box {
                    width: 48px;
                    height: 48px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--brand-green);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
                    flex-shrink: 0;
                }
                .info-text h4 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: #1e293b;
                }
                .info-text p {
                    color: #64748b;
                    margin: 0;
                    font-size: 0.95rem;
                }
                .contact-form-wrapper {
                    padding: 20px;
                }
                .form-group {
                    margin-bottom: 24px;
                }
                .form-label {
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }
                .form-control-custom {
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-size: 1rem;
                    transition: all 0.2s;
                    width: 100%;
                    outline: none;
                }
                .form-control-custom:focus {
                    background: white;
                    border-color: var(--brand-green);
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
                }
                .btn-submit {
                    background: var(--brand-green);
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    width: 100%;
                }
                .btn-submit:hover:not(:disabled) {
                    background: var(--brand-green-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .back-home-btn {
                    position: absolute;
                    top: 40px;
                    left: 40px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 100px;
                    color: #374151;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .back-home-btn:hover {
                    background: #F9FAFB;
                    transform: translateX(-4px);
                }
                @media (max-width: 768px) {
                    .contact-title { font-size: 2.5rem; }
                    .back-home-btn { top: 20px; left: 20px; padding: 8px 16px; }
                }
            `}</style>

            <header className="contact-header">
                <div className="container">
                    <h1 className="contact-title">Contact Us</h1>
                    <p className="contact-subtitle">
                        Have questions or suggestions? We'd love to hear from you.
                        Our team is here to help you.
                    </p>
                </div>
            </header>

            <main className="contact-container">
                <div className="row g-5">
                    {/* Contact Info Column */}
                    <div className="col-lg-5">
                        <div className="info-card">
                            <h2 className="h3 fw-bold mb-4" style={{ color: '#0f172a' }}>Quick Information</h2>
                            <p className="text-secondary mb-5">Reach out to us through any of these channels or use the form to send us a direct message.</p>

                            <div className="info-item">
                                <div className="icon-box">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div className="info-text">
                                    <h4>Call Us</h4>
                                    <p>+92 309 62*****</p>
                                    <p className="small opacity-75">Mon - Sat, 9am - 8pm</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-box">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div className="info-text">
                                    <h4>Email Us</h4>
                                    <p>info@ogms.com</p>
                                    <p className="small opacity-75">We reply within 24 hours</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-box">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div className="info-text">
                                    <h4>Visit Us</h4>
                                    <p>Lahore, Pakistan</p>
                                </div>
                            </div>

                            <div className="mt-5 p-4 rounded-4 bg-white border border-light">
                                <h5 className="fw-bold mb-2 small text-uppercase tracking-wider text-muted">Academic Project</h5>
                                <p className="small text-secondary mb-0">This system (OGMS) is for educational purposes as part of an FYP. All communications are simulated.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Column */}
                    <div className="col-lg-7">
                        <div className="contact-form-wrapper">
                            <h2 className="h3 fw-bold mb-4" style={{ color: '#0f172a' }}>Send a Message</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label">Full Name<RequiredAsterisk /></label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control-custom"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label">Email Address<RequiredAsterisk /></label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control-custom"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number<RequiredAsterisk /></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control-custom"
                                        placeholder="+92 300 1234567"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Message<RequiredAsterisk /></label>
                                    <textarea
                                        name="message"
                                        className="form-control-custom"
                                        rows="5"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">send</span>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactUs;
