import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const AboutUs = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="about-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />

            <style>{`
                .about-header {
                    background: linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%);
                    padding: 80px 0 60px;
                    text-align: center;
                }
                .about-badge {
                    background: #DCFCE7;
                    color: #10B981;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 20px;
                    display: inline-block;
                }
                .about-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .about-subtitle {
                    font-size: 1.125rem;
                    color: #4B5563;
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                .about-content {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 80px 20px;
                }
                .feature-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 24px;
                    padding: 40px;
                    height: 100%;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #10B981;
                }
                .icon-circle {
                    width: 64px;
                    height: 64px;
                    background: #F0FDF4;
                    color: #10B981;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .vision-section {
                    background: #F8FAFC;
                    padding: 100px 0;
                    border-radius: 40px;
                    margin: 40px;
                }
                .mission-text {
                    font-size: 1.125rem;
                    color: #4B5563;
                    line-height: 1.8;
                }
                .brand-text {
                    color: #10B981;
                    font-weight: 700;
                }
            `}</style>

            <header className="about-header">
                <div className="container">
                    <span className="about-badge">Our Company</span>
                    <h1 className="about-title">Our Story</h1>
                    <div className="about-subtitle mx-auto">
                        <p className="mb-3">
                            The Online Grocery Management System (OGMS) was developed to simplify and modernize the way grocery operations are managed in a digital environment. Our goal is to provide a structured and efficient platform that connects customers and administrators through a secure and user-friendly system.
                        </p>
                        <p className="mb-0">
                            By integrating modern web technologies, OGMS brings grocery browsing, order management, and inventory control into a centralized web-based solution. The system demonstrates how traditional grocery store processes can be transformed into a streamlined digital workflow.
                        </p>
                    </div>
                </div>
            </header>

            <main className="about-content">
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="icon-circle">
                                <span className="material-symbols-outlined fs-2">inventory_2</span>
                            </div>
                            <h5 className="fw-bold mb-3">Freshness First</h5>
                            <p className="text-muted small mb-0">OGMS emphasizes proper inventory monitoring and product management. Through organized catalogues and real-time stock tracking, the system ensures that product information remains accurate and up to date.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="icon-circle">
                                <span className="material-symbols-outlined fs-2">content_paste_go</span>
                            </div>
                            <h5 className="fw-bold mb-3">Efficient Processing</h5>
                            <p className="text-muted small mb-0">The platform supports a structured order management system where customers can place orders easily and administrators can monitor, process, and update order statuses efficiently.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="feature-card">
                            <div className="icon-circle">
                                <span className="material-symbols-outlined fs-2">verified_user</span>
                            </div>
                            <h5 className="fw-bold mb-3">Secure & Reliable</h5>
                            <p className="text-muted small mb-0">Security is a key focus of OGMS. The system implements role-based authentication, encrypted password storage, and protected routes to ensure secure access for both customers and administrators.</p>
                        </div>
                    </div>
                </div>

                <div className="vision-section">
                    <div className="container text-center px-4">
                        <h2 className="fw-800 mb-4" style={{ fontSize: '2.5rem', color: '#0F172A' }}>Our Vision</h2>
                        <div className="max-width-700 mx-auto">
                            <p className="mission-text mb-4">
                                At <span className="brand-text">OGMS</span>, we believe that grocery management should be simple, transparent, and well-organized. The platform is built on the principles of efficiency, usability, and secure system design.
                            </p>
                            <p className="mission-text mb-0">
                                Our vision is to provide a scalable web-based solution that demonstrates how digital systems can enhance operational control, improve customer experience, and support better decision-making in retail environments.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center px-3">
                    <h2 className="fw-bold mb-4">Why Choose OGMS?</h2>
                    <div className="text-muted mx-auto" style={{ maxWidth: '900px' }}>
                        <p className="mb-3">
                            The Online Grocery Management System (OGMS) is designed to address the operational challenges of managing grocery stores in a digital format. With features such as real-time inventory tracking, structured order management, role-based access control, and dashboard analytics, OGMS provides a complete and organized management solution.
                        </p>
                        <p className="mb-0">
                            Developed as a Final Year Project, the system reflects the integration of full-stack web development, database design, and secure authentication practices, making it both academically significant and practically adaptable.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;
