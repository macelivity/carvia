import React from 'react';

const Impressum = () => (
    <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Impressum</h1>
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
);

export default Impressum;