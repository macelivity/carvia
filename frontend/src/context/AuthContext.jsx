import { createContext, useContext, useState, useEffect } from 'react';
import API, { getProfile } from '../api/api'; // API importieren

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Rollen-Mapping basierend auf der Datenbank (RolleID) und Sitemap-Begriffen
const mapRolleIdToRole = (rolleId) => {
    switch (rolleId) {
        case 1: return 'Mitglied'; // Annahme: RolleID 1 = User/Mitglied
        case 2: return 'Admin';    // Annahme: RolleID 2 = Admin
        case 3: return 'Mitarbeiter';// Annahme: RolleID 3 = Manager/Mitarbeiter
        default: return 'guest';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ username: "Gast", role: "guest" });
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
                        username: backendUser.Username, // Sicherstellen, dass username gesetzt ist
                        role: mapRolleIdToRole(backendUser.RolleID),
                    };
                    setUser(initialUser);
                } catch (error) {
                    // console.error("[AuthContext] Fehler bei der Initialisierung des Auth-Status:", error); // Entfernt
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser({ username: "Gast", role: "guest" });
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
            setUser({ username: "Gast", role: "guest" }); // Fallback
            return;
        }
        
        const newUserState = {
            ...backendUser,
            role: mapRolleIdToRole(backendUser.rolle_id), // Korrigiert von backendUser.rolle_id zu backendUser.RolleID
        };
        setUser(newUserState);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete API.defaults.headers.common['Authorization'];
        setUser({ username: "Gast", role: "guest" });
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
