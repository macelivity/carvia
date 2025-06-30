import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t mt-16 py-8 px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
                <div className="space-x-4 text-blue-700 font-medium">
                    <Link
                        className="hover:underline focus:outline-none"
                        to="/datenschutz"
                    >
                        Datenschutz
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                        className="hover:underline focus:outline-none"
                        to="/impressum"
                    >
                        Impressum
                    </Link>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                    &copy; {new Date().getFullYear()} Carvia. Alle Rechte vorbehalten.
                </div>
            </div>
        </footer>
    );
};

export default Footer;