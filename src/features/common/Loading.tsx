import React from 'react';

// TODO: Add a more sophisticated loading indicator with CSS file
export const Loading: React.FC = () => (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            zIndex: 2000
        }}
    >
        Loading...
    </div>
);
