import React from 'react';
import { useTranslation } from 'react-i18next';

const Datenschutz = () => {
    const { t } = useTranslation();
    
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">{t('datenschutz.title')}</h1>
            <p className="mb-2">
                <strong>{t('datenschutz.section1Title')}</strong><br />
                {t('datenschutz.section1Content')}
            </p>
            <p className="mb-2">
                <strong>{t('datenschutz.section2Title')}</strong><br />
                {t('datenschutz.section2Content').split('\\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < t('datenschutz.section2Content').split('\\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </p>
            <p className="mb-2">
                <strong>{t('datenschutz.section3Title')}</strong><br />
                {t('datenschutz.section3Content')}
            </p>
            <p className="mb-2">
                <strong>{t('datenschutz.section4Title')}</strong><br />
                {t('datenschutz.section4Content')}
            </p>
            <p className="mb-2">
                <strong>{t('datenschutz.section5Title')}</strong><br />
                {t('datenschutz.section5Content')}
            </p>
            <p className="mb-2">
                <strong>{t('datenschutz.section6Title')}</strong><br />
                {t('datenschutz.section6Content')}
            </p>
        </div>
    );
};

export default Datenschutz;