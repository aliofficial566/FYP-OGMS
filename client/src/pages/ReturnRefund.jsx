import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const ReturnRefund = () => {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', day: 'numeric'
    });

    return (
        <div className="policy-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />
            <style>{`
                .policy-header {
                    background: linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%);
                    padding: 100px 0 60px;
                    text-align: center;
                }
                .policy-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .policy-subtitle {
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

            <header className="policy-header">
                <div className="container">
                    <h1 className="policy-title">Return & Refund Policy</h1>
                    <p className="policy-subtitle">
                        Clear guidance on how we handle returns and refunds within the system demonstration context.
                    </p>
                    <div className="mt-4 text-muted small">
                        Effective Date: {currentDate}
                    </div>
                </div>
            </header>

            <main className="content-section">
                <div className="mb-5">
                    <p>
                        The <span className="system-name">Online Grocery Management System (OGMS)</span> is developed as a Final Year Project (FYP) for academic demonstration purposes. This Return & Refund Policy outlines the procedures and conditions related to order returns and refunds within the system.
                    </p>
                </div>

                <h2>1. Purpose of the Policy</h2>
                <p>This policy defines the process for handling product returns and refunds within the OGMS platform. As the system is developed for academic and demonstration purposes, transactions performed within the system are simulated and do not represent real financial exchanges.</p>

                <h2>2. Return Eligibility</h2>
                <p>In a real-world implementation scenario, customers may request a return under the following conditions:</p>
                <ul>
                    <li>The product received is damaged or defective</li>
                    <li>The wrong product was delivered</li>
                    <li>The product is expired or of unsatisfactory quality</li>
                    <li>The return request is made within the eligible return period</li>
                </ul>
                <p>For the purpose of this academic project, return functionality (if implemented) serves as a system demonstration and does not involve actual physical product handling.</p>

                <h2>3. Return Request Process</h2>
                <p>If return functionality is available in the system, the general process is as follows:</p>
                <ul>
                    <li>The customer logs into their account</li>
                    <li>The customer selects the relevant order from their order history</li>
                    <li>A return request is submitted with a valid reason</li>
                    <li>The administrator reviews the request</li>
                    <li>The administrator approves or rejects the return request</li>
                    <li>The order status may be updated accordingly within the system</li>
                </ul>

                <h2>4. Refund Policy</h2>
                <p>Since OGMS operates primarily with Cash on Delivery (COD) in demonstration mode:</p>
                <ul>
                    <li>No real payment transactions are processed</li>
                    <li>Refunds are simulated within the system for academic purposes only</li>
                    <li>If payment simulation is implemented, refund status will be reflected in the order management section</li>
                </ul>

                <h2>5. Non-Returnable Items</h2>
                <p>In a practical grocery management environment, the following items may typically be non-returnable:</p>
                <ul>
                    <li>Perishable food items</li>
                    <li>Opened or used products</li>
                    <li>Items without proof of order</li>
                    <li>Products damaged due to customer negligence</li>
                </ul>
                <p>These conditions are included for conceptual completeness within the academic scope of the project.</p>

                <h2>6. Administrative Authority</h2>
                <p>The system administrator reserves the right to:</p>
                <ul>
                    <li>Approve or reject return requests</li>
                    <li>Update order status</li>
                    <li>Maintain transaction records</li>
                </ul>
                <p>All actions are logged within the system for management and reporting purposes.</p>

                <h2>7. Limitation of Liability</h2>
                <p>OGMS is developed solely for academic demonstration and evaluation. The system developers and institution are not responsible for:</p>
                <ul>
                    <li>Real-world product returns</li>
                    <li>Financial disputes</li>
                    <li>Commercial liabilities</li>
                </ul>
                <p>All transactions within the system are part of a simulated environment.</p>

                <h2>8. Modifications to This Policy</h2>
                <p>OGMS reserves the right to modify this Return & Refund Policy if system features are enhanced or expanded.</p>

                <div className="academic-notice">
                    <h5 className="fw-bold mb-2">Academic Notice</h5>
                    <p className="mb-0 small text-dark opacity-75">
                        The Online Grocery Management System (OGMS) is a Final Year Project developed for educational purposes. Return and refund operations described in this policy represent simulated processes and are not part of an operational commercial platform.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ReturnRefund;
