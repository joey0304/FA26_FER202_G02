
import { createContext, useContext, useEffect, useState } from 'react';
import { storeRequest } from '../services/carStoreService';

const Context = createContext(null);

// Phiên đăng nhập mô phỏng lưu sessionStorage. Không thay thế xác thực backend thật.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        storeRequest('me')
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email, password) {
        const data = await storeRequest('login', 'POST', { email, password });
        setUser(data.user);
    }

    async function logout() {
        await storeRequest('logout', 'POST');
        setUser(null);
    }

    return (
        <Context.Provider value={{ user, setUser, loading, login, logout }}>
            {children}
        </Context.Provider>
    );
}

export const useAuth = () => useContext(Context);
