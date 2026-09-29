import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const FAQs = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        {
            question: "How do I create an account?",
            answer: "To create an account, click on the Sign Up button and fill in your details such as name, email, password, and delivery address. After registration, you can log in using your email and password.",
            icon: "person_add"
        },
        {
            question: "I forgot my password. What should I do?",
            answer: "If you forget your password, use the Forgot Password option (if available) or contact the system administrator for assistance.",
            icon: "lock_reset"
        },
        {
            question: "How do I place an order?",
            answer: "To place an order: Browse products by category or use the search. Add items to your cart. Go to your cart and click Checkout. Confirm your delivery details and place the order.",
            icon: "shopping_basket"
        },
        {
            question: "What payment methods are available?",
            answer: "Currently, the system supports Cash on Delivery (COD). No online payment is processed as this is an academic demonstration project.",
            icon: "payments"
        },
        {
            question: "Is my personal information secure?",
            answer: "Yes. Your password is encrypted, and secure authentication mechanisms are used to protect your account information.",
            icon: "shield_with_heart"
        },
        {
            question: "What should I do if I receive a damaged product?",
            answer: "If a damaged product is received, you can contact the administrator and request assistance according to the return policy.",
            icon: "report_problem"
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-page bg-white min-vh-100">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />

            <style>{`
                .faq-header {
                    background: linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%);
                    padding: 80px 0 60px;
                    text-align: center;
                }
                .faq-badge {
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
                .faq-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .faq-subtitle {
                    font-size: 1.125rem;
                    color: #4B5563;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .faq-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 20px 100px;
                }
                .faq-item {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    margin-bottom: 16px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .faq-item:hover {
                    border-color: #10B981;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
                }
                .faq-item.active {
                    border-color: #10B981;
                    background: #F0FDF4;
                }
                .faq-question {
                    width: 100%;
                    padding: 24px;
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    text-align: left;
                    cursor: pointer;
                }
                .faq-icon-box {
                    width: 44px;
                    height: 44px;
                    background: #F0FDF4;
                    color: #10B981;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.3s;
                }
                .faq-item.active .faq-icon-box {
                    background: #10B981;
                    color: white;
                }
                .faq-question-text {
                    font-weight: 700;
                    font-size: 1.125rem;
                    color: #1F2937;
                    flex-grow: 1;
                }
                .faq-chevron {
                    color: #94A3B8;
                    transition: transform 0.3s ease;
                }
                .faq-item.active .faq-chevron {
                    transform: rotate(180deg);
                    color: #10B981;
                }
                .faq-answer {
                    max-height: 0;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 0 24px 0 88px;
                    opacity: 0;
                }
                .faq-item.active .faq-answer {
                    max-height: 200px;
                    padding-bottom: 24px;
                    opacity: 1;
                }
                .answer-text {
                    color: #4B5563;
                    line-height: 1.6;
                    font-size: 1rem;
                }
            `}</style>

            <header className="faq-header">
                <div className="container">
                    <span className="faq-badge">Help Center</span>
                    <h1 className="faq-title">FAQs</h1>
                    <p className="faq-subtitle">
                        Everything you need to know about using OGMS. Can't find the answer?
                        Contact our support team.
                    </p>
                </div>
            </header>

            <main className="faq-container">
                {faqData.map((faq, index) => (
                    <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                        <button className="faq-question" onClick={() => toggleAccordion(index)}>
                            <div className="faq-icon-box">
                                <span className="material-symbols-outlined">{faq.icon}</span>
                            </div>
                            <span className="faq-question-text">{faq.question}</span>
                            <span className="material-symbols-outlined faq-chevron">expand_more</span>
                        </button>
                        <div className="faq-answer">
                            <div className="answer-text">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="text-center mt-5 p-5 rounded-4" style={{ background: '#F8FAFC' }}>
                    <h4 className="fw-bold mb-3">Still have questions?</h4>
                    <p className="text-muted mb-4">We're here to help you with anything you need.</p>
                    <button className="btn btn-success px-5 py-3 rounded-pill fw-bold" onClick={() => window.location.href = '/contact-us'}>
                        Contact Support
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FAQs;
