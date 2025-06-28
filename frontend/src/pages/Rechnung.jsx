import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Rechnung() {
  const { reservierungsId } = useParams();
  const [rechnung, setRechnung] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Passe den API-Endpunkt ggf. an dein Setup an!
    fetch(`/api/rechnung/${reservierungsId}`)
      .then(res => res.json())
      .then(data => {
        setRechnung(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reservierungsId]);

  const downloadPDF = () => {
    if (!rechnung) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Rechnung', 14, 18);

    doc.setFontSize(12);
    doc.text('Carvia GmbH\nMusterstraße 1\n12345 Musterstadt', 14, 30);
    doc.text(`Rechnungsdatum: ${rechnung.Austellungsdatum || new Date().toLocaleDateString('de-DE')}`, 150, 30);

    // Kundendaten dynamisch aus rechnung verwenden, falls vorhanden
    doc.text(
      `Kunde:\n${rechnung.KundeName || ''}\n${rechnung.KundeAdresse || ''}\n${rechnung.KundePLZOrt || ''}`,
      14,
      50
    );

    doc.autoTable({
      startY: 80,
      head: [['Leistung', 'Fahrzeug', 'Bezahlt', 'Ausstellungsdatum']],
      body: [
        [
          'Fahrzeugmiete',
          rechnung.FahrzeugID,
          rechnung.Bezahlt ? 'Ja' : 'Nein',
          rechnung.Austellungsdatum || '-'
        ]
      ]
    });

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
      <div className="mb-8">
        <h3 className="font-semibold">Kunde</h3>
        <div>
          Max Mustermann<br />
          Kundenstraße 2<br />
          54321 Kundenstadt
        </div>
      </div>
      <table className="w-full mb-8 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Leistung</th>
            <th className="border px-2 py-1 text-left">Fahrzeug</th>
            <th className="border px-2 py-1 text-left">Bezahlt</th>
            <th className="border px-2 py-1 text-left">Ausstellungsdatum</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">Fahrzeugmiete</td>
            <td className="border px-2 py-1">{rechnung.FahrzeugID}</td>
            <td className="border px-2 py-1">{rechnung.Bezahlt ? 'Ja' : 'Nein'}</td>
            <td className="border px-2 py-1">{rechnung.Austellungsdatum || '-'}</td>
          </tr>
        </tbody>
      </table>
      <div className="text-right text-lg font-bold mb-8">
        {/* Hier ggf. Gesamtbetrag ergänzen, falls im Backend vorhanden */}
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