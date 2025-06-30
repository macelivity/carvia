import React, { useState } from 'react';

const Footer = () => {
    const [showImpressum, setShowImpressum] = useState(false);
    const [showDatenschutz, setShowDatenschutz] = useState(false);

    return (
        <footer className="bg-white border-t mt-16 py-8 px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
                <div className="space-x-4 text-blue-700 font-medium">
                    <button
                        className="hover:underline focus:outline-none"
                        onClick={() => setShowDatenschutz(true)}
                    >
                        Datenschutz
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                        className="hover:underline focus:outline-none"
                        onClick={() => setShowImpressum(true)}
                    >
                        Impressum
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-2">
                    &copy; {new Date().getFullYear()} Carvia. Alle Rechte vorbehalten.
                </div>
            </div>

            {/* Impressum Modal */}
            {showImpressum && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowImpressum(false)}>
                    <div
                        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowImpressum(false)}
                            aria-label="Schließen"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-blue-700">Impressum</h2>
                        <p className="mb-2"><strong>Angaben gemäß § 5 TMG:</strong></p>
                        <p>
                            Carvia GmbH<br />
                            Musterstraße 1<br />
                            12345 Musterstadt<br />
                            Deutschland
                        </p>
                        <p className="mt-4">
                            <strong>Vertreten durch:</strong><br />
                            Max Mustermann
                        </p>
                        <p className="mt-4">
                            <strong>Kontakt:</strong><br />
                            Telefon: 01234 / 567890<br />
                            E-Mail: info@carvia.de
                        </p>
                        <p className="mt-4">
                            <strong>Registereintrag:</strong><br />
                            Eintragung im Handelsregister.<br />
                            Registergericht: Musterstadt<br />
                            Registernummer: HRB 123456
                        </p>
                        <p className="mt-4">
                            <strong>Umsatzsteuer-ID:</strong><br />
                            Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                            DE123456789
                        </p>
                        <p className="mt-4">
                            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
                            Max Mustermann<br />
                            Musterstraße 1<br />
                            12345 Musterstadt
                        </p>
                        <p className="mt-4 text-xs text-gray-500">
                            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                        </p>
                    </div>
                </div>
            )}

            {/* Datenschutz Modal */}
            {showDatenschutz && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowDatenschutz(false)}>
                    <div
                        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowDatenschutz(false)}
                            aria-label="Schließen"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-blue-700">Datenschutzerklärung</h2>
                        <p className="mb-2">
                            <strong>1. Datenschutz auf einen Blick</strong><br />
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.
                        </p>
                        <p className="mb-2">
                            <strong>2. Verantwortliche Stelle</strong><br />
                            Carvia GmbH<br />
                            Musterstraße 1<br />
                            12345 Musterstadt<br />
                            E-Mail: info@carvia.de
                        </p>
                        <p className="mb-2">
                            <strong>3. Erhebung und Speicherung personenbezogener Daten</strong><br />
                            Wir erheben und speichern Ihre Daten nur, soweit dies zur Bereitstellung unserer Dienste erforderlich ist. Details entnehmen Sie unserer vollständigen Datenschutzerklärung.
                        </p>
                        <p className="mb-2">
                            <strong>4. Ihre Rechte</strong><br />
                            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer gespeicherten personenbezogenen Daten sowie ein Recht auf Widerspruch gegen die Verarbeitung.
                        </p>
                        <p className="mb-2">
                            <strong>5. Kontakt Datenschutzbeauftragter</strong><br />
                            E-Mail: datenschutz@carvia.de
                        </p>
                        <p className="mb-2">
                            <strong>6. Weitere Informationen</strong><br />
                            Ausführliche Informationen finden Sie in unserer vollständigen Datenschutzerklärung.
                        </p>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;