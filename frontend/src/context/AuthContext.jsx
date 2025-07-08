import { createContext, useContext, useState, useEffect } from 'react';
import API, { getProfile } from '../api/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Rollen-Mapping basierend auf der Datenbank
const mapRolleIdToRole = (rolleId) => {
    switch (rolleId) {
        case 1: return 'Mitglied';
        case 2: return 'Admin';
        case 3: return 'Mitarbeiter';
        default: return 'guest';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ username: "Gast", role: 'guest', userID: null }); // userID hinzugefügt
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await getProfile(); // Profil vom Backend laden
                    const backendUser = response.data.user;
                    const initialUser = {
                        ...backendUser,
                        username: backendUser.username, // Sicherstellen, dass username gesetzt ist
                        role: mapRolleIdToRole(backendUser.RolleID),
                        userID: backendUser.UserID, // userID aus Backend-Daten übernehmen
                    };
                    setUser(initialUser);
                } catch (error) {
                    // console.error("[AuthContext] Fehler bei der Initialisierung des Auth-Status:", error); // Entfernt
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser({ username: "Gast", role: "guest", userID: null }); // userID zurücksetzen
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (authData) => {
        localStorage.setItem('accessToken', authData.access_token);
        localStorage.setItem('refreshToken', authData.refresh_token);

        const backendUser = authData.user;
        if (!backendUser) {
            // console.error('[AuthContext] backendUser is undefined in authData:', authData); // Entfernt
            setUser({ username: "Gast", role: "guest", userID: null }); // Fallback mit userID
            return;
        }
        
        const newUserState = {
            ...backendUser,
            username: backendUser.username, // Explizit Username setzen, falls nicht direkt im Spread enthalten
            role: mapRolleIdToRole(backendUser.rolle_id), // Korrigiert und sichergestellt
            userID: backendUser.user_id, // userID aus Backend-Daten übernehmen
        };
        setUser(newUserState);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete API.defaults.headers.common['Authorization'];
        setUser({ username: "Gast", role: "guest", userID: null }); // userID zurücksetzen
    };

    if (loading) {
        return <div>Laden...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loadingAuth: loading }}>
            {children}
        </AuthContext.Provider>
    );
};
