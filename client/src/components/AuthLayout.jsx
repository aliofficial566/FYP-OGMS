import React from 'react';
import { Logo } from './Branding';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="container-fluid p-0 vh-100 overflow-hidden bg-light">
            <div className="row g-0 h-100">
                {/* Left Side: Hero Area (Copied from Signup design) */}
                <div className="col-lg-5 d-none d-lg-block position-relative">
                    <div className="h-100 w-100">
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2070&auto=format&fit=crop"
                            alt="Fresh groceries"
                            className="h-100 w-100 object-fit-cover"
                            style={{ objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(16, 185, 129, 0.4)', mixBlendMode: 'multiply' }}></div>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)' }}></div>
                    </div>

                    <div className="position-absolute bottom-0 start-0 p-5 text-white">
                        {/* Branding */}
                        <div className="mb-4">
                            <Logo size="lg" dark />
                        </div>

                        {/* Tagline */}
                        <div>
                            <h1 className="display-5 fw-bold mb-3 text-white">
                                Start your healthy life with fresh groceries.
                            </h1>
                            <p className="lead mb-4 opacity-75">
                                Join the most efficient online grocery management system designed for your daily nutritional needs.
                            </p>

                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex">
                                    <img src="https://i.pravatar.cc/40?u=1" className="rounded-circle border border-2 border-white ms-0" style={{ width: '40px' }} alt="User" />
                                    <img src="https://i.pravatar.cc/40?u=2" className="rounded-circle border border-2 border-white" style={{ width: '40px', marginLeft: '-10px' }} alt="User" />
                                    <img src="https://i.pravatar.cc/40?u=3" className="rounded-circle border border-2 border-white" style={{ width: '40px', marginLeft: '-10px' }} alt="User" />
                                </div>
                                <span className="small fw-semibold text-white">+2k happy members</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Area */}
                <div className="col-lg-7 col-12 h-100 overflow-auto bg-white shadow-lg d-flex flex-column">
                    <div className="p-4 p-md-5 my-auto mx-auto w-100" style={{ maxWidth: '800px' }}>
                        <header className="mb-5">
                            <h2 className="fw-bold text-dark h1">{title}</h2>
                            <p className="text-muted">{subtitle}</p>
                        </header>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;


