import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, logout as apilogout } from '../api/api';

/**
 * Authentifizierungskontext für die Carsharing-Anwendung
 * Verwaltet Benutzeranmeldung, Benutzerstate und Token-Management
 */

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/**
 * Konvertiert die Rollen-ID aus der Datenbank in lesbare Rollennamen
 * @param {number} rolleId - Die Rollen-ID aus der Datenbank
 * @returns {string} Der entsprechende Rollenname
 */
const mapRolleIdToRole = (rolleId) => {
    switch (rolleId) {
        case 1: return 'Mitglied';
        case 2: return 'Admin';
        case 3: return 'Mitarbeiter';
        default: return 'guest';
    }
};

/**
 * AuthProvider-Komponente
 * Stellt Authentifizierungslogik für die gesamte Anwendung bereit
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ 
        username: "Gast", 
        role: 'guest', 
        userID: null 
    });
    const [loading, setLoading] = useState(true);

    /**
     * Initialisiert den Authentifizierungsstatus beim Laden der Anwendung
     * Überprüft vorhandene Tokens und lädt Benutzerprofil
     */
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await getProfile();
                    const backendUser = response.data.user;
                    const initialUser = {
                        ...backendUser,
                        username: backendUser.Username,
                        role: mapRolleIdToRole(backendUser.RolleID),
                        userID: backendUser.UserID,
                    };
                    setUser(initialUser);
                } catch (error) {
                    // Token ungültig - Benutzer ausloggen
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser({ username: "Gast", role: "guest", userID: null });
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    /**
     * Meldet einen Benutzer an und speichert die Authentifizierungsdaten
     * @param {Object} authData - Authentifizierungsdaten vom Backend
     */
    const login = (authData) => {
        localStorage.setItem('accessToken', authData.access_token);
        localStorage.setItem('refreshToken', authData.refresh_token);

        const backendUser = authData.user;
        if (!backendUser) {
            setUser({ username: "Gast", role: "guest", userID: null });
            return;
        }
        
        // Normalisiere die Datenstruktur (snake_case zu PascalCase)
        const newUserState = {
            UserID: backendUser.user_id,
            Username: backendUser.username,
            Vorname: backendUser.vorname,
            Nachname: backendUser.nachname,
            RolleID: backendUser.rolle_id,
            username: backendUser.username,
            role: mapRolleIdToRole(backendUser.rolle_id),
            userID: backendUser.user_id,
        };
        setUser(newUserState);
    };

    /**
     * Meldet den aktuellen Benutzer ab und löscht alle gespeicherten Daten
     */
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        apilogout();
        setUser({ username: "Gast", role: "guest", userID: null });
    };

    // Ladebildschirm während der Initialisierung
    if (loading) {
        return <div>Laden...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loadingAuth: loading }}>
            {children}
        </AuthContext.Provider>
    );
};
