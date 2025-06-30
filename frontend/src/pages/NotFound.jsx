import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Seite nicht gefunden</h1>
            <p>Die von Ihnen gesuchte Seite existiert nicht.</p>
            <Link to="/">
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Zurück zur Hauptseite</button>
            </Link>
        </div>
    );
};

export default NotFound;
