import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Branding';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <style>{`
                .error-container {
                    max-width: 600px;
                    text-align: center;
                }
                .error-code {
                    font-size: 15rem;
                    font-weight: 900;
                    line-height: 1;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0;
                    opacity: 0.15;
                    position: absolute;
                    left: 50%;
                    top: 45%;
                    transform: translate(-50%, -50%);
                    z-index: 0;
                }
                .error-content {
                    position: relative;
                    z-index: 1;
                }
                .error-illustration {
                    font-size: 120px;
                    color: #10B981;
                    margin-bottom: 2rem;
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .btn-home {
                    background: #10B981;
                    border: none;
                    padding: 12px 32px;
                    font-weight: 700;
                    border-radius: 100px;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
                }
                .btn-home:hover {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.3);
                }
            `}</style>

            <div className="error-container position-relative">
                <div className="error-code">404</div>

                <div className="error-content">
                    <div className="mb-4">
                        <Logo size="lg" />
                    </div>

                    <div className="error-illustration material-symbols-outlined">
                        sentiment_dissatisfied
                    </div>

                    <h1 className="display-4 fw-black text-dark mb-3">Oops! Page Not Found</h1>
                    <p className="text-secondary fs-5 mb-5 px-lg-5">
                        It seems like you've wandered into the organic unknown. The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="d-flex gap-3 justify-content-center">
                        <button
                            className="btn btn-home btn-lg text-white d-flex align-items-center gap-2"
                            onClick={() => navigate('/')}
                        >
                            <span className="material-symbols-outlined">home</span>
                            Back to Home
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-bold border-2"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
