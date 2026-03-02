import React from 'react';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const PageLayout = ({ children }) => {
    const location = useLocation();

    // Check if the current route is an admin route
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Check if the current route is authentication (optional, but usually branding footers are for main app)
    // However, the user said "every page", so I'll include it unless it's explicitly problematic.

    return (
        <div className="page-wrapper">
            <main className="content-area">
                {children}
            </main>

            {/* Display Footer on every page except maybe some specific ones if needed */}
            {/* But for now, following "every page" instruction */}
            <Footer />

            <style>{`
                .page-wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background-color: var(--page-bg);
                }
                .content-area {
                    flex: 1 0 auto;
                }
            `}</style>
        </div>
    );
};

export default PageLayout;
