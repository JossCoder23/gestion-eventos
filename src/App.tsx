import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './components/Login';
import CheckinPanel from './components/CheckinPanel';

const App: React.FC = () => {
    
    const { user, isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        // Al montar la app, verificamos si la sesión en el servidor sigue viva
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="app-container">
            {!isAuthenticated ? (
                <Login />
            ) : (
                <div className="dashboard">
                    <header>
                        <span>Bienvenido, {user?.nombres}</span>
                        <button onClick={() => useAuthStore.getState().logout()}>Salir</button>
                    </header>
                    <CheckinPanel />
                </div>
            )}
        </div>
    );
};

export default App;