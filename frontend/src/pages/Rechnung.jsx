import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { getRechnungByReservierungsId, getRechnung, getVehicleById, getProfile } from '../api/api';

export default function Rechnung() {
  const { rechnungID } = useParams();
  const [searchParams] = useSearchParams();
  const reservierungsId = searchParams.get('reservation');
  const [rechnung, setRechnung] = useState(null);
  const [fahrzeug, setFahrzeug] = useState(null);
  const [kunde, setKunde] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        let rechnungRes;
        if (rechnungID) {
          rechnungRes = await getRechnung(rechnungID);
        } else {
          rechnungRes = await getRechnungByReservierungsId(reservierungsId);
        }
        if (!isMounted) return;
        setRechnung(rechnungRes.data);

        // Fahrzeugdaten nachladen, falls vorhanden
        if (rechnungRes.data?.FahrzeugID) {
          const fahrzeugRes = await getVehicleById(rechnungRes.data.FahrzeugID);
          if (!isMounted) return;
          setFahrzeug(fahrzeugRes.data);
        }
        // Kundendaten über getProfile laden
        const kundeRes = await getProfile();
        if (!isMounted) return;
        setKunde(kundeRes.data.user || kundeRes.data);
      } catch {
        // Fehlerbehandlung
      }
      setLoading(false);
    };
    fetchData();
    return () => { isMounted = false; };
  }, [rechnungID, reservierungsId]);

  const fahrzeugInfo = fahrzeug
    ? [
      fahrzeug.Hersteller,
      fahrzeug.ModellName,
      fahrzeug.Kennzeichen
    ].filter(Boolean).join(' ')
    : '-';

  const preis = rechnung?.Preis || rechnung?.Gesamtpreis || '-';

  const kundeInfo = kunde
    ? [
        (kunde.Vorname || kunde.vorname || '') + " " + (kunde.Nachname || kunde.nachname || ''),
        (kunde.Strasse || kunde.strasse || '') + " " + (kunde.HausNummer || kunde.hausnummer || ''),
        (kunde.PLZ || kunde.plz || '') + " " + (kunde.Ort || kunde.ort || '')
      ].filter(line => line.trim()).join('\n')
    : 'Kundendaten nicht verfügbar.';

  const bankInfo = kunde
    ? [
        kunde.IBAN || kunde.iban || '',
        kunde.BIC || kunde.bic || ''
      ].filter(Boolean).join('\n')
    : 'Kundendaten nicht verfügbar.';

  const downloadPDF = () => {
    if (!rechnung) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Rechnung', 14, 18);

    doc.setFontSize(12);
    doc.text('Carvia GmbH\nMusterstraße 1\n12345 Musterstadt', 14, 30);

    // Kundendaten und Bankdaten nebeneinander (wie im HTML)
    doc.setFontSize(12);
    doc.text('Kunde:', 14, 50);
    doc.text(kundeInfo, 14, 56);

    doc.text('Bank:', 110, 50);
    doc.text(bankInfo, 110, 56);

    autoTable(doc, {
      startY: 80,
      head: [['Leistung', 'Fahrzeug', 'Bezahlt', 'Ausstellungsdatum', 'Preis (€)']],
      body: [
        [
          'Fahrzeugmiete',
          fahrzeugInfo || '-',
          rechnung.Bezahlt ? 'Ja' : 'Nein',
          rechnung.Austellungsdatum || '-',
          preis
        ]
      ]
    });

    doc.text(`Gesamtbetrag: ${preis} €`, 14, doc.lastAutoTable.finalY + 15);

    doc.save(`Rechnung_${rechnung.id || reservierungsId}.pdf`);
  };

  if (loading) return <div className="p-6">Lade Rechnung...</div>;
  if (!rechnung) return <div className="p-6 text-red-500">Rechnung nicht gefunden.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded shadow border">
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold">Carvia GmbH</h2>
          <div>Musterstraße 1<br />12345 Musterstadt</div>
        </div>
        <div className="text-right">
          <div><strong>Rechnungsdatum:</strong> {rechnung.Austellungsdatum || '-'}</div>
          <div><strong>Rechnungsnummer:</strong> {rechnung.id || reservierungsId}</div>
        </div>
      </div>
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-semibold">Kunde</h3>
          <div style={{ whiteSpace: 'pre-line' }}>
            {kunde ? [
              kunde.Vorname + " " + kunde.Nachname,
              kunde.Strasse + " " + kunde.HausNummer,
              kunde.PLZ + " " + kunde.Ort
            ].filter(Boolean).join('\n') : 'Kundendaten nicht verfügbar.'}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Bank</h3>
          <div style={{ whiteSpace: 'pre-line' }}>
            {kunde ? [
              kunde.IBAN,
              kunde.BIC
            ].filter(Boolean).join('\n') : 'Kundendaten nicht verfügbar.'}
          </div>
        </div>
      </div>
      <table className="w-full mb-8 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Leistung</th>
            <th className="border px-2 py-1 text-left">Fahrzeug</th>
            <th className="border px-2 py-1 text-left">Bezahlt</th>
            <th className="border px-2 py-1 text-left">Ausstellungsdatum</th>
            <th className="border px-2 py-1 text-left">Preis (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">Fahrzeugmiete</td>
            <td className="border px-2 py-1">{fahrzeugInfo}</td>
            <td className="border px-2 py-1">{rechnung.Bezahlt ? 'Ja' : 'Nein'}</td>
            <td className="border px-2 py-1">{rechnung.Austellungsdatum || '-'}</td>
            <td className="border px-2 py-1">{preis}</td>
          </tr>
        </tbody>
      </table>
      <div className="text-right text-lg font-bold mb-8">
        Gesamtbetrag: {preis} €
      </div>
      <button
        onClick={downloadPDF}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Als PDF herunterladen
      </button>
    </div>
  );
}