// filepath: [Account.jsx](http://_vscodecontentref_/1)
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

export default function Account() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    Strasse: "",
    HausNummer: "",
    Ort: "",
    PLZ: ""
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Passwort ändern
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    new_password_repeat: ""
  });
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios.get("/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setProfile(res.data.user);
        setForm({
          Strasse: res.data.user.Strasse || "",
          HausNummer: res.data.user.HausNummer || "",
          Ort: res.data.user.Ort || "",
          PLZ: res.data.user.PLZ || ""
        });
        setLoading(false);
      })
      .catch(() => {
        setError(t('account.errorLoadingProfile'));
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const token = localStorage.getItem("accessToken");
    try {
      await axios.put("/api/auth/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile({ ...profile, ...form });
      setEdit(false);
      setSuccessMsg(t('account.profileUpdateSuccess'));
    } catch {
      setError(t('account.profileUpdateError'));
    }
  };

  // Passwort-Formular-Handler
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    
    // Custom validation
    if (!pwForm.current_password) {
      setPwError(t('account.currentPasswordRequired'));
      return;
    }
    if (!pwForm.new_password) {
      setPwError(t('account.newPasswordRequired'));
      return;
    }
    if (!pwForm.new_password_repeat) {
      setPwError(t('account.confirmPasswordRequired'));
      return;
    }
    if (pwForm.new_password !== pwForm.new_password_repeat) {
      setPwError(t('account.passwordMismatch'));
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError(t('account.passwordTooShort'));
      return;
    }
    
    const token = localStorage.getItem("accessToken");
    try {
      await axios.put("/api/auth/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPwMsg(t('account.passwordChangeSuccess'));
      setPwForm({
        current_password: "",
        new_password: "",
        new_password_repeat: ""
      });
      setShowPwForm(false);
    } catch (err) {
      // Provide specific error messages based on status code
      if (err?.response?.status === 400) {
        setPwError(t('account.passwordIncorrect'));
      } else if (err?.response?.status >= 500) {
        setPwError(t('account.passwordChangeServerError'));
      } else {
        setPwError(t('account.passwordChangeError'));
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{t('account.title')}</h2>
      {loading && <p>{t('account.loadingProfile')}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {successMsg && <p className="text-green-600">{successMsg}</p>}
      {!loading && !error && profile && (
        <>
          {!edit ? (
            <div>
              <table className="min-w-[350px] border border-gray-300 bg-white shadow rounded">
                <tbody>
                  <tr><td className="font-semibold p-2 border">{t('auth.username')}:</td><td className="p-2 border">{profile.Username}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.firstName')}:</td><td className="p-2 border">{profile.Vorname}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.lastName')}:</td><td className="p-2 border">{profile.Nachname}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.birthDate')}:</td><td className="p-2 border">{profile.Geburtsdatum}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.joinDate')}:</td><td className="p-2 border">{profile.BeitrittsDatum}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.city')}:</td><td className="p-2 border">{profile.Ort}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.postalCode')}:</td><td className="p-2 border">{profile.PLZ}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.street')}:</td><td className="p-2 border">{profile.Strasse}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.houseNumber')}:</td><td className="p-2 border">{profile.HausNummer}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.driverLicense')}:</td><td className="p-2 border">{profile.Führerschein}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.iban')}:</td><td className="p-2 border">{profile.IBAN}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.bic')}:</td><td className="p-2 border">{profile.BIC}</td></tr>
                </tbody>
              </table>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setEdit(true)}
                >
                  {t('account.editProfile')}
                </button>
                <button
                  type="button"
                  className="bg-yellow-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowPwForm(!showPwForm)}
                >
                  {t('account.changePassword')}
                </button>
              </div>
              {showPwForm && (
                <form onSubmit={handlePwSave} className="mt-4 max-w-md">
                  <div className="mb-2">
                    <label className="block font-semibold">{t('account.currentPassword')}</label>
                    <input
                      type="password"
                      name="current_password"
                      value={pwForm.current_password}
                      onChange={handlePwChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-semibold">{t('account.newPassword')}</label>
                    <input
                      type="password"
                      name="new_password"
                      value={pwForm.new_password}
                      onChange={handlePwChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-semibold">{t('account.repeatNewPassword')}</label>
                    <input
                      type="password"
                      name="new_password_repeat"
                      value={pwForm.new_password_repeat}
                      onChange={handlePwChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  {pwError && <p className="text-red-600 mb-2">{pwError}</p>}
                  {pwMsg && <p className="text-green-600 mb-2">{pwMsg}</p>}
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {t('account.savePassword')}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-2 rounded ml-2"
                    onClick={() => {
                      setShowPwForm(false);
                      setPwForm({
                        current_password: "",
                        new_password: "",
                        new_password_repeat: ""
                      });
                      setPwError("");
                      setPwMsg("");
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <table className="min-w-[350px] border border-gray-300 bg-white shadow rounded">
                <tbody>
                  <tr><td className="font-semibold p-2 border">{t('auth.username')}:</td><td className="p-2 border">{profile.Username}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.firstName')}:</td><td className="p-2 border">{profile.Vorname}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.lastName')}:</td><td className="p-2 border">{profile.Nachname}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('auth.birthDate')}:</td><td className="p-2 border">{profile.Geburtsdatum}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.joinDate')}:</td><td className="p-2 border">{profile.BeitrittsDatum}</td></tr>
                  <tr>
                    <td className="font-semibold p-2 border">{t('account.city')}:</td>
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
                    <td className="font-semibold p-2 border">{t('account.postalCode')}:</td>
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
                    <td className="font-semibold p-2 border">{t('account.street')}:</td>
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
                    <td className="font-semibold p-2 border">{t('account.houseNumber')}:</td>
                    <td className="p-2 border">
                      <input
                        name="HausNummer"
                        value={form.HausNummer}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                  </tr>
                  <tr><td className="font-semibold p-2 border">{t('account.driverLicense')}:</td><td className="p-2 border">{profile.Führerschein}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.iban')}:</td><td className="p-2 border">{profile.IBAN}</td></tr>
                  <tr><td className="font-semibold p-2 border">{t('account.bic')}:</td><td className="p-2 border">{profile.BIC}</td></tr>
                </tbody>
              </table>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                >
                  {t('account.saveProfile')}
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setEdit(false);
                    setForm({
                      Strasse: profile.Strasse || "",
                      HausNummer: profile.HausNummer || "",
                      Ort: profile.Ort || "",
                      PLZ: profile.PLZ || ""
                    });
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}