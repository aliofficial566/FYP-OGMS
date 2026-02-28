import React from 'react';

/**
 * Global Branding Configuration
 * Change these values to update the logo and brand name across the entire application.
 */
export const BRANDING = {
    name: 'OGMS',
    fullName: 'Online Grocery Management System',
    logoIcon: 'shopping_basket', // Material Symbol name
    themeColor: '#10B981',
    accentColor: '#059669',
    tagline: 'Start your healthy life with fresh groceries.'
};

/**
 * Reusable Logo Component
 * @param {string} size - 'sm', 'md', 'lg', 'xl' (affects font size and icon size)
 * @param {string} color - CSS color to override the default theme color
 * @param {boolean} showTagline - Whether to show the branding tagline
 * @param {boolean} dark - Whether to use a white version (for dark backgrounds)
 */
export const Logo = ({ size = 'md', color, showTagline = false, dark = false }) => {
    const brandColor = color || (dark ? '#FFFFFF' : BRANDING.themeColor);

    // Scale based on size
    const scales = {
        sm: { icon: 'fs-4', text: 'fs-5' },
        md: { icon: 'fs-2', text: 'fs-3' },
        lg: { icon: 'display-6', text: 'display-6' },
        xl: { icon: 'display-4', text: 'display-5' }
    };

    const scale = scales[size] || scales.md;

    return (
        <div className="d-flex flex-column">
            <div className={`d-flex align-items-center gap-2 fw-bold`} style={{ color: brandColor }}>
                <span className={`material-symbols-outlined ${scale.icon}`}>
                    {BRANDING.logoIcon}
                </span>
                <span className={`${scale.text}`} style={{ letterSpacing: '-0.02em' }}>
                    {BRANDING.name}
                </span>
            </div>
            {showTagline && (
                <p className="text-muted small mb-0 mt-n1 opacity-75">{BRANDING.tagline}</p>
            )}
        </div>
    );
};

export default Logo;
