import React from 'react';
import { useTranslation } from 'react-i18next';

const Impressum = () => {
    const { t } = useTranslation();
    
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">{t('impressum.title')}</h1>
            <p className="mb-2"><strong>{t('impressum.legalInfo')}</strong></p>
            <p>
                {t('impressum.companyName')}<br />
                {t('impressum.address')}<br />
                {t('impressum.city')}<br />
                {t('impressum.country')}
            </p>
            <p className="mt-4">
                <strong>{t('impressum.representedBy')}</strong><br />
                {t('impressum.representative')}
            </p>
            <p className="mt-4">
                <strong>{t('impressum.contact')}</strong><br />
                {t('impressum.phone')}<br />
                {t('impressum.email')}
            </p>
            <p className="mt-4">
                <strong>{t('impressum.commercialRegister')}</strong><br />
                {t('impressum.registerEntry')}<br />
                {t('impressum.registerCourt')}<br />
                {t('impressum.registerNumber')}
            </p>
            <p className="mt-4">
                <strong>{t('impressum.vatId')}</strong><br />
                {t('impressum.vatNumber')}<br />
                {t('impressum.vatNumberValue')}
            </p>
            <p className="mt-4">
                <strong>{t('impressum.responsibleContent')}</strong><br />
                {t('impressum.responsiblePerson')}<br />
                {t('impressum.address')}<br />
                {t('impressum.city')}
            </p>
            <p className="mt-4 text-xs text-gray-500">
                {t('impressum.disclaimer')}
            </p>
        </div>
    );
};

export default Impressum;