import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState({ isOpen: false, initialView: 'login', message: null });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="categories-page bg-white min-vh-100">
            <Navbar onOpenAuth={(view, message) => setAuthModal({ isOpen: true, initialView: view || 'login', message: message || null })} />

            <AuthModal
                isOpen={authModal.isOpen}
                initialView={authModal.initialView}
                message={authModal.message}
                onClose={() => setAuthModal({ isOpen: false, initialView: 'login', message: null })}
                onSuccess={() => setAuthModal({ isOpen: false, initialView: 'login', message: null })}
            />

            <style>{`
                .categories-header {
                    background: linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%);
                    padding: 80px 0 40px;
                    text-align: center;
                }
                .categories-title {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #064E3B;
                    margin-bottom: 16px;
                    letter-spacing: -0.02em;
                }
                .categories-subtitle {
                    font-size: 1.125rem;
                    color: #374151;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                .categories-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px 100px;
                }
                .category-card {
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 30px;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: 2px solid transparent;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .category-card:hover {
                    background: white;
                    border-color: var(--brand-green);
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.1);
                }
                .category-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                .category-card:hover .category-icon-wrapper {
                    background: var(--brand-green-light);
                    transform: scale(1.05);
                }
                .category-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
                .category-count {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 500;
                }
            `}</style>

            <header className="categories-header">
                <div className="container">
                    <h1 className="categories-title">Shop by Category</h1>
                    <p className="categories-subtitle">
                        Explore our wide range of categories and find exactly what you need.
                    </p>
                </div>
            </header>

            <main className="categories-container">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading categories...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {categories.map((cat, index) => (
                            <div className="col-6 col-md-4 col-lg-3" key={index}>
                                <div 
                                    className="category-card"
                                    onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)}
                                >
                                    <div className="category-icon-wrapper">
                                        {cat.image_url ? (
                                            <img 
                                                src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`} 
                                                alt={cat.name} 
                                                style={{ width: '48px', height: '48px', objectFit: 'contain' }} 
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-success" style={{ fontSize: '36px' }}>category</span>
                                        )}
                                    </div>
                                    <div className="category-name">{cat.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Categories;
