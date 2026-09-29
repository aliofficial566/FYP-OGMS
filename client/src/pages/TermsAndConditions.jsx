import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="terms-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />
            <style>{`
                .terms-header {
                    background: linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%);
                    padding: 100px 0 60px;
                    text-align: center;
                }
                .terms-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .terms-subtitle {
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
                    text-align: left;
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
                    border-left: 4px solid #3B82F6;
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

            <header className="terms-header">
                <div className="container">
                    <h1 className="terms-title">Terms & Conditions</h1>
                    <p className="terms-subtitle">
                        Please read these terms and conditions carefully before using the Online Grocery Management System (OGMS) platform.
                    </p>
                    <div className="mt-4 text-muted small">
                        Effective Date: {currentDate}
                    </div>
                </div>
            </header>

            <main className="content-section">
                <div className="mb-5">
                    <p>
                        Welcome to the <span className="system-name">Online Grocery Management System (OGMS)</span>. By accessing or using this system, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using the platform.
                    </p>
                    <p>
                        If you do not agree with these terms, you should not use the system.
                    </p>
                </div>

                <h2>1. Purpose of the System</h2>
                <p>The Online Grocery Management System (OGMS) is a web-based platform developed as a Final Year Project (FYP) for academic purposes. The system is designed to simulate and demonstrate online grocery store operations, including user registration, product management, order placement, and administrative control.</p>
                <p>OGMS is intended for academic demonstration and evaluation purposes and does not operate as a commercial retail platform.</p>

                <h2>2. User Accounts</h2>
                <p>To access certain features of the system, users must create an account by providing accurate and complete information.</p>
                <p>Users agree to:</p>
                <ul>
                    <li>Provide valid and truthful information during registration</li>
                    <li>Maintain the confidentiality of their login credentials</li>
                    <li>Notify the administrator in case of unauthorized account access</li>
                    <li>Use the system only for lawful and academic purposes</li>
                </ul>
                <p>The system reserves the right to suspend or terminate accounts that violate these terms.</p>

                <h2>3. Role-Based Access</h2>
                <p>OGMS operates on a Role-Based Access Control (RBAC) model:</p>
                <ul>
                    <li>Customers may browse products, manage their cart, and place orders.</li>
                    <li>Administrators may manage catalogues, products, inventory, and orders.</li>
                </ul>
                <p>Users are strictly prohibited from attempting to access features or data beyond their assigned role.</p>

                <h2>4. Orders and Transactions</h2>
                <p>Orders placed within the system are recorded for demonstration purposes.</p>
                <ul>
                    <li>The system may simulate Cash on Delivery (COD) transactions.</li>
                    <li>Order status updates (Processing, Shipped, Delivered) are managed by administrators.</li>
                    <li>As this is an academic project, transactions do not represent real financial exchanges.</li>
                </ul>

                <h2>5. Acceptable Use</h2>
                <p>Users agree not to:</p>
                <ul>
                    <li>Use the system for illegal activities</li>
                    <li>Attempt to gain unauthorized access to the database or backend services</li>
                    <li>Exploit system vulnerabilities</li>
                    <li>Upload malicious or harmful data</li>
                    <li>Interfere with system performance or security</li>
                </ul>
                <p>Any misuse may result in account suspension and academic disciplinary action if applicable.</p>

                <h2>6. Data Accuracy and Availability</h2>
                <p>While reasonable efforts are made to ensure accurate system functionality, OGMS does not guarantee:</p>
                <ul>
                    <li>Continuous availability without interruption</li>
                    <li>Error-free operation at all times</li>
                    <li>Complete accuracy of displayed data</li>
                </ul>
                <p>The system may undergo maintenance or updates as required.</p>

                <h2>7. Intellectual Property</h2>
                <p>All source code, design, database structure, and documentation related to OGMS are developed as part of an academic project and are protected under academic and intellectual property guidelines.</p>
                <p>Unauthorized copying, distribution, or commercial use of the system without permission is prohibited.</p>

                <h2>8. Limitation of Liability</h2>
                <p>OGMS is developed for academic purposes only. The developers and institution shall not be held liable for:</p>
                <ul>
                    <li>Data loss</li>
                    <li>System downtime</li>
                    <li>Unauthorized access caused by user negligence</li>
                    <li>Any damages arising from misuse of the platform</li>
                </ul>

                <h2>9. Privacy</h2>
                <p>User information is collected and processed according to the OGMS Privacy Policy. By using the system, users agree to the data handling practices described therein.</p>

                <h2>10. Modifications to Terms</h2>
                <p>OGMS reserves the right to modify these Terms and Conditions if system features are updated or expanded. Updated terms will be reflected on this page.</p>

                <h2>11. Governing Context</h2>
                <p>This system is developed strictly within an academic environment as a Final Year Project. All usage is subject to institutional academic policies and guidelines.</p>

                <h2>12. Contact</h2>
                <p>For any questions or concerns regarding these Terms and Conditions, users may contact the system administrator through official academic channels.</p>

                <div className="academic-notice">
                    <h5 className="fw-bold mb-2">Academic Context</h5>
                    <p className="mb-0 small text-dark opacity-75">
                        This repository and system are strictly for academic demonstration. All operational simulated data is for educational purposes only.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default TermsAndConditions;
