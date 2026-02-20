import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../api/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    puntoId: number | null; // <-- Nuevo
    setUser: (user: User | null) => void;
    setPuntoId: (id: number) => void; // <-- Acción para guardar el punto
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            
            checkAuth: async () => {
                try {
                    const { data } = await api.get<User>('/user');
                    set({ user: data, isAuthenticated: true });
                } catch (error: any) {
                    // Solo borramos si el servidor confirma que la sesión expiró (401 o 419)
                    if (error.response?.status === 401 || error.response?.status === 419) {
                        set({ user: null, isAuthenticated: false });
                        localStorage.removeItem('auth-storage'); // Forzamos limpieza
                    }
                }
            },

            logout: async () => {
                try {
                    await api.post('/logout');
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },
            puntoId: null,
            setPuntoId: (id) => set({ puntoId: id }),
        }),
        { name: 'auth-storage' } // Nombre de la cookie/localStorage
    )
);