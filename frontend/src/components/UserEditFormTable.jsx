import React, { useState } from "react";

export default function UserEditFormTable({ userData, onSave, onCancel }) {
    const [form, setForm] = useState({
        Username: userData.Username || "",
        Vorname: userData.Vorname || "",
        Nachname: userData.Nachname || "",
        Geburtsdatum: userData.Geburtsdatum || "",
        Ort: userData.Ort || "",
        PLZ: userData.PLZ || "",
        Strasse: userData.Strasse || "",
        HausNummer: userData.HausNummer || ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...userData, ...form });
    };

    return (
        <form onSubmit={handleSubmit}>
            <table className="min-w-[350px] border border-gray-300 bg-white shadow rounded">
                <tbody>
                    <tr>
                        <td className="font-semibold p-2 border">Benutzername:</td>
                        <td className="p-2 border">
                            <input
                                name="Username"
                                value={form.Username}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Vorname:</td>
                        <td className="p-2 border">
                            <input
                                name="Vorname"
                                value={form.Vorname}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Nachname:</td>
                        <td className="p-2 border">
                            <input
                                name="Nachname"
                                value={form.Nachname}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Geburtsdatum:</td>
                        <td className="p-2 border">
                            <input
                                name="Geburtsdatum"
                                type="date"
                                value={form.Geburtsdatum}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Beitrittsdatum:</td>
                        <td className="p-2 border">{userData.BeitrittsDatum}</td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Ort:</td>
                        <td className="p-2 border">
                            <input
                                name="Ort"
                                value={form.Ort}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">PLZ:</td>
                        <td className="p-2 border">
                            <input
                                name="PLZ"
                                value={form.PLZ}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Straße:</td>
                        <td className="p-2 border">
                            <input
                                name="Strasse"
                                value={form.Strasse}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-2 border">Hausnummer:</td>
                        <td className="p-2 border">
                            <input
                                name="HausNummer"
                                value={form.HausNummer}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                        </td>
                    </tr>
                    <tr><td className="font-semibold p-2 border">Führerschein:</td><td className="p-2 border">{userData.Führerschein}</td></tr>
                    <tr><td className="font-semibold p-2 border">IBAN:</td><td className="p-2 border">{userData.IBAN}</td></tr>
                    <tr><td className="font-semibold p-2 border">BIC:</td><td className="p-2 border">{userData.BIC}</td></tr>
                </tbody>
            </table>
            <div className="mt-4">
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                >
                    Speichern
                </button>
                <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                    onClick={onCancel}
                >
                    Abbrechen
                </button>
            </div>
        </form>
    );
}