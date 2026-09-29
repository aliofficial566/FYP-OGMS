import React from 'react';

/**
 * Global Branding Configuration
 * Change these values to update the logo and brand name across the entire application.
 */
export const BRANDING = {
    name: 'OGMS',
    fullName: 'Online Grocery Management System',
    logoUrl: '/OGMS Logo.png',
    themeColor: '#10B981',
    accentColor: '#059669',
    tagline: 'Start your healthy life with fresh groceries.'
};

/**
 * Reusable Logo Component
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {boolean} showTagline - Whether to show the branding tagline
 */
export const Logo = ({ size = 'md', showTagline = false }) => {
    // Scale based on size
    const scales = {
        sm: { height: '24px' },
        md: { height: '40px' },
        lg: { height: '60px' },
        xl: { height: '80px' }
    };

    const scale = scales[size] || scales.md;

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-center">
                <img
                    src={BRANDING.logoUrl}
                    alt={BRANDING.name}
                    style={{
                        height: scale.height,
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>
            {showTagline && (
                <p className="text-muted small mb-0 mt-1 opacity-75">{BRANDING.tagline}</p>
            )}
        </div>
    );
};

export default Logo;
