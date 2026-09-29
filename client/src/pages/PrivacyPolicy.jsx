import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="privacy-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />
            <style>{`
                .privacy-header {
                    background: linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%);
                    padding: 100px 0 60px;
                    text-align: center;
                }
                .privacy-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .privacy-subtitle {
                    font-size: 1.125rem;
                    color: #374151;
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                .content-section {
                    max-width: 900px;
                    margin-left: max(40px, calc((100vw - 1200px) / 2));
                    padding: 40px 20px 100px;
                }
                .content-section h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 48px 0 24px;
                }
                .content-section h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 32px 0 16px;
                }
                .content-section p {
                    font-size: 1rem;
                    color: #4B5563;
                    line-height: 1.8;
                    margin-bottom: 20px;
                }
                .content-section ul {
                    list-style: none;
                    padding-left: 0;
                    margin-bottom: 32px;
                }
                .content-section li {
                    position: relative;
                    padding-left: 28px;
                    margin-bottom: 12px;
                    color: #4B5563;
                    line-height: 1.6;
                }
                .content-section li::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 10px;
                    width: 6px;
                    height: 6px;
                    background-color: #10B981;
                    border-radius: 50%;
                }
                .academic-notice {
                    background-color: #F9FAFB;
                    border-left: 4px solid #F59E0B;
                    padding: 24px;
                    border-radius: 0 12px 12px 0;
                    margin-top: 60px;
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
                    border-color: #D1D5DB;
                    transform: translateX(-4px);
                }
                .system-name {
                    font-weight: 700;
                    color: #10B981;
                }
            `}</style>

            <header className="privacy-header">
                <div className="container">
                    <h1 className="privacy-title">Privacy Policy</h1>
                    <p className="privacy-subtitle mb-2">
                        Online Grocery Management System (OGMS)
                    </p>
                    <div className="text-muted small fw-medium">
                        Effective Date: March 3, 2026
                    </div>
                </div>
            </header>

            <main className="content-section">
                <div className="mb-5">
                    <p>
                        The <span className="system-name">Online Grocery Management System (OGMS)</span> values the privacy of its users. This Privacy Policy outlines how we collect, use, and protect your information when you access and use the platform.
                    </p>
                    <p>
                        By using OGMS, you agree to the terms described in this policy.
                    </p>
                </div>

                <h2>1. Information We Collect</h2>
                <p>To provide our services effectively, OGMS may collect the following information:</p>

                <h3>Personal Information</h3>
                <ul>
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>Delivery Address</li>
                </ul>

                <h3>Account Information</h3>
                <ul>
                    <li>Login credentials</li>
                    <li>User role</li>
                </ul>

                <h3>Order Information</h3>
                <ul>
                    <li>Order details</li>
                    <li>Purchase history</li>
                    <li>Order status records</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>The collected information is used to:</p>
                <ul>
                    <li>Create and manage user accounts</li>
                    <li>Process and manage grocery orders</li>
                    <li>Maintain order records</li>
                    <li>Provide user support</li>
                    <li>Improve system functionality</li>
                </ul>
                <p>Information is collected solely for operational and academic purposes related to the system.</p>

                <h2>3. Data Protection</h2>
                <p>OGMS takes reasonable measures to protect user information from unauthorized access, misuse, or disclosure. Access to personal data is restricted to authorized personnel within the system.</p>

                <h2>4. Data Sharing</h2>
                <p>OGMS does not sell, rent, or share personal information with third parties. User information is used only within the scope of the system’s functionality.</p>

                <h2>5. Data Storage</h2>
                <p>User data is securely stored and maintained for system operation and academic evaluation purposes only.</p>

                <h2>6. User Rights</h2>
                <p>Users may:</p>
                <ul>
                    <li>Access their personal information</li>
                    <li>Update their account details</li>
                    <li>View their order history</li>
                    <li>Request account deactivation (if applicable)</li>
                </ul>

                <h2>7. Policy Updates</h2>
                <p>OGMS may update this Privacy Policy if system features change. Any updates will be reflected on this page.</p>

                <div className="academic-notice">
                    <h5 className="fw-bold mb-2">Academic Notice</h5>
                    <p className="mb-0 small text-dark opacity-75">
                        The Online Grocery Management System (OGMS) is developed as a Final Year Project (FYP) for academic purposes. The platform is not a commercial grocery service.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
