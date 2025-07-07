import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    
    return (
        <footer className="bg-white border-t mt-16 py-8 px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
                <div className="space-x-4 text-blue-700 font-medium">
                    <Link
                        className="hover:underline focus:outline-none"
                        to="/datenschutz"
                    >
                        {t('footer.privacy')}
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                        className="hover:underline focus:outline-none"
                        to="/impressum"
                    >
                        {t('footer.imprint')}
                    </Link>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                    © {new Date().getFullYear()} Carvia. {t('footer.allRightsReserved')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;