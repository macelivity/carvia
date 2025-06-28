import React, { useState } from 'react';

const footerStyle = {
    backgroundColor: '#f5f5f5',
    padding: '20px 0',
    borderTop: '1px solid #e0e0e0',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#555',
    marginTop: '40px'
};

const linkStyle = {
    color: '#1976d2',
    textDecoration: 'none',
    margin: '0 10px',
    cursor: 'pointer'
};

const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
};

const closeBtnStyle = {
    position: 'absolute',
    top: 10,
    right: 20,
    fontSize: '1.5rem',
    color: '#888',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
};

const Footer = () => {
    const [showImpressum, setShowImpressum] = useState(false);
    const [showDatenschutz, setShowDatenschutz] = useState(false);

    return (
        <footer style={footerStyle}>
            <div>
                <span style={linkStyle} onClick={() => setShowDatenschutz(true)}>
                    Datenschutz
                </span>
                |
                <span style={linkStyle} onClick={() => setShowImpressum(true)}>
                    Impressum
                </span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888' }}>
                &copy; {new Date().getFullYear()} Carvia. Alle Rechte vorbehalten.
            </div>

            {showImpressum && (
                <div style={modalStyle} onClick={() => setShowImpressum(false)}>
                    <div style={{ ...modalContentStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={closeBtnStyle} onClick={() => setShowImpressum(false)} aria-label="Schließen">&times;</button>
                        <h2>Impressum</h2>
                        <p><strong>Angaben gemäß § 5 TMG:</strong></p>
                        <p>
                            Carvia GmbH<br />
                            Musterstraße 1<br />
                            12345 Musterstadt<br />
                            Deutschland
                        </p>
                        <p>
                            <strong>Vertreten durch:</strong><br />
                            Max Mustermann
                        </p>
                        <p>
                            <strong>Kontakt:</strong><br />
                            Telefon: 01234 / 567890<br />
                            E-Mail: info@carvia.de
                        </p>
                        <p>
                            <strong>Registereintrag:</strong><br />
                            Eintragung im Handelsregister.<br />
                            Registergericht: Musterstadt<br />
                            Registernummer: HRB 123456
                        </p>
                        <p>
                            <strong>Umsatzsteuer-ID:</strong><br />
                            Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                            DE123456789
                        </p>
                        <p>
                            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
                            Max Mustermann<br />
                            Musterstraße 1<br />
                            12345 Musterstadt
                        </p>
                        <p>
                            <strong>Haftungsausschluss:</strong><br />
                            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                        </p>
                    </div>
                </div>
            )}

            {showDatenschutz && (
                <div style={modalStyle} onClick={() => setShowDatenschutz(false)}>
                    <div style={{ ...modalContentStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={closeBtnStyle} onClick={() => setShowDatenschutz(false)} aria-label="Schließen">&times;</button>
                        <h2>Datenschutzerklärung</h2>
                        <p>
                            <strong>1. Datenschutz auf einen Blick</strong><br />
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.
                        </p>
                        <p>
                            <strong>2. Verantwortliche Stelle</strong><br />
                            Carvia GmbH<br />
                            Musterstraße 1<br />
                            12345 Musterstadt<br />
                            E-Mail: info@carvia.de
                        </p>
                        <p>
                            <strong>3. Erhebung und Speicherung personenbezogener Daten</strong><br />
                            Wir erheben und speichern Ihre Daten nur, soweit dies zur Bereitstellung unserer Dienste erforderlich ist. Details entnehmen Sie unserer vollständigen Datenschutzerklärung.
                        </p>
                        <p>
                            <strong>4. Ihre Rechte</strong><br />
                            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer gespeicherten personenbezogenen Daten sowie ein Recht auf Widerspruch gegen die Verarbeitung.
                        </p>
                        <p>
                            <strong>5. Kontakt Datenschutzbeauftragter</strong><br />
                            E-Mail: datenschutz@carvia.de
                        </p>
                        <p>
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