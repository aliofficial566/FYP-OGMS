import React, { useEffect, useState } from 'react';

const Toast = ({ type = 'success', title, message, onClose, duration = 4000 }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration) {
            const interval = 10;
            const step = (interval / duration) * 100;

            const timer = setInterval(() => {
                setProgress(prev => Math.max(0, prev - step));
            }, interval);

            const closeTimer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => {
                clearInterval(timer);
                clearTimeout(closeTimer);
            };
        }
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const isSuccess = type === 'success';

    return (
        <div
            className="position-fixed top-0 end-0 p-4"
            style={{
                zIndex: 9999,
                animation: isExiting ? 'toast-fade-out 0.3s forwards' : 'toast-fade-in 0.3s forwards'
            }}
        >
            <div
                className="toast-card position-relative overflow-hidden"
                style={{
                    minWidth: '350px',
                    background: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '24px'
                }}
            >
                {/* Progress Bar */}
                <div
                    className="position-absolute bottom-0 start-0 h-1"
                    style={{
                        width: `${progress}%`,
                        background: isSuccess ? '#10B981' : '#EF4444',
                        height: '4px',
                        transition: 'width 0.01s linear',
                        opacity: '0.6'
                    }}
                />

                {/* Icon Container */}
                <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '56px',
                        height: '56px',
                        background: isSuccess ? '#ECFDF5' : '#FEF2F2',
                        color: isSuccess ? '#10B981' : '#EF4444',
                        borderRadius: '16px'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                        {isSuccess ? 'check_circle' : 'error'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-grow-1 pe-3">
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: '#1E293B', letterSpacing: '-0.01em' }}>
                        {title}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {message}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    className="toast-close-btn"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
            </div>

            <style>{`
                .toast-close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 8px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .toast-close-btn:hover {
                    color: #EF4444 !important;
                    background: #FEF2F2;
                    transform: rotate(90deg);
                }

                @keyframes toast-fade-in {
                    from { opacity: 0; transform: translateX(50px) scale(0.95); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }

                @keyframes toast-fade-out {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to { opacity: 0; transform: translateX(50px) scale(0.95); }
                }
            `}</style>
        </div>
    );
};

export default Toast;
