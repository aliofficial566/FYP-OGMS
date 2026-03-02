import React from 'react';
import { Logo } from './Branding';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="container">
                    <div className="row g-4 pb-5">
                        {/* Column 1: Logo & Social Media */}
                        <div className="col-lg-3 col-md-6 footer-section">
                            <div className="mb-4">
                                <Logo size="md" />
                            </div>
                            <p className="footer-text mb-4">
                                Your one-stop shop for fresh groceries and daily essentials.
                                Quality you can trust, delivered to your doorstep.
                            </p>
                            <div className="social-links-row">
                                <a href="#" className="social-icon-circle facebook" aria-label="Facebook">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="#" className="social-icon-circle instagram" aria-label="Instagram">
                                    <i className="bi bi-instagram"></i>
                                </a>
                                <a href="#" className="social-icon-circle twitter" aria-label="Twitter">
                                    <i className="bi bi-twitter-x"></i>
                                </a>
                                <a href="#" className="social-icon-circle google" aria-label="Google">
                                    <i className="bi bi-google"></i>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="col-lg-3 col-md-6 footer-section">
                            <h5 className="footer-heading">Quick Links</h5>
                            <ul className="footer-links">
                                <li><a href="#">My Account</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">FAQs</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Policy */}
                        <div className="col-lg-3 col-md-6 footer-section">
                            <h5 className="footer-heading">Policy</h5>
                            <ul className="footer-links">
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms & Conditions</a></li>
                                <li><a href="#">Return Policy</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact Information */}
                        <div className="col-lg-3 col-md-6 footer-section">
                            <h5 className="footer-heading">Contact Information</h5>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <span className="material-symbols-outlined fs-5">location_on</span>
                                    <span>Lahore, Pakistan</span>
                                </div>
                                <div className="contact-item">
                                    <span className="material-symbols-outlined fs-5">mail</span>
                                    <a href="mailto:info@ogms.om">info@ogms.om</a>
                                </div>
                                <div className="contact-item">
                                    <span className="material-symbols-outlined fs-5">call</span>
                                    <a href="tel:03000000000">03000000000</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar - Centered copyright only */}
                    <div className="footer-bottom py-4 border-top">
                        <div className="text-center">
                            <p className="mb-0 small text-muted">
                                OGMS © {new Date().getFullYear()}. All Rights Reserved. Online Grocery Management System.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-container {
                    background-color: #ffffff;
                    margin-top: 80px;
                    border-top: 1px solid #f1f5f9;
                }
                .footer-content {
                    padding-top: 60px;
                    color: #334155;
                }
                .footer-text {
                    color: #64748b;
                    line-height: 1.6;
                    font-size: 0.9rem;
                    max-width: 250px;
                }
                .footer-heading {
                    color: #0f172a;
                    font-weight: 700;
                    font-size: 1.05rem;
                    margin-bottom: 24px;
                }
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-links li {
                    margin-bottom: 12px;
                }
                .footer-links a {
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                }
                .footer-links a:hover {
                    color: #10b981;
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #64748b;
                    font-size: 0.875rem;
                }
                .contact-item a {
                    color: inherit;
                    text-decoration: none;
                }
                .contact-item span.material-symbols-outlined {
                    color: #10b981;
                }
                
                .social-links-row {
                    display: flex;
                    gap: 12px;
                }
                .social-icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    border: 1px solid #e2e8f0;
                }
                .social-icon-circle:hover {
                    background: #10b981;
                    color: #ffffff;
                    border-color: #10b981;
                    transform: translateY(-2px);
                }
                
                .footer-bottom {
                    border-color: #f1f5f9 !important;
                }
                
                @media (max-width: 768px) {
                    .footer-content {
                        padding-top: 40px;
                    }
                    .footer-section {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .social-links-row {
                        justify-content: center;
                    }
                    .contact-item {
                        justify-content: center;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
