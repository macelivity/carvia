import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();
    
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{t('notFound.title')}</h1>
            <p>{t('notFound.message')}</p>
            <Link to="/">
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>{t('notFound.backHome')}</button>
            </Link>
        </div>
    );
};

export default NotFound;
