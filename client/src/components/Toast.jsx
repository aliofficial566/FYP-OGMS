import React, { useEffect, useState } from 'react';

const Toast = ({ type = 'success', title, message, onClose, duration = 4000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
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
                animation: isExiting ? 'fade-out 0.3s forwards' : 'fade-in 0.3s forwards'
            }}
        >
            <div
                className="card border-0 shadow-lg p-3 d-flex flex-row align-items-center gap-3 rounded-4 bg-white"
                style={{ minWidth: '320px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            >
                <span
                    className={`material-symbols-outlined ${isSuccess ? 'text-success' : 'text-danger'}`}
                    style={{ fontSize: '2.5rem' }}
                >
                    {isSuccess ? 'check_circle' : 'error'}
                </span>
                <div className="flex-grow-1">
                    <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>{title}</div>
                    <div className="text-muted small mt-1">{message}</div>
                </div>
                <button
                    type="button"
                    className="btn-close ms-auto align-self-start mt-1 shadow-none"
                    onClick={handleClose}
                    aria-label="Close"
                    style={{ fontSize: '0.7rem' }}
                ></button>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-out {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

export default Toast;
