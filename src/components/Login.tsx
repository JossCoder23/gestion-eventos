import React, { useState } from 'react';
import api from '../api/api';
import type { LoginResponse } from '../types';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => { // Ya no recibe props

    const [ credentials, setCredentials ] = useState({ email: '', password: '' });
    const [ loading, setLoading ] = useState(false);
    const setUser = useAuthStore((state) => state.setUser); // Obtenemos la acción del store

    const handleSubmit = async (e: React.SubmitEvent) => {

        e.preventDefault();
        setLoading(true);

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: 'https://comerciald11.sg-host.com' });
            const { data } = await api.post<LoginResponse>('/login', credentials);
            
            // Actualizamos el estado global directamente
            setUser(data.user);
        } catch (error: any) {
            alert(error.response?.data?.message || "Credenciales incorrectas");
        } finally {
            setLoading(false);
        }

    };

    return (
        <div style={ styles.loginWrapper }>
            <form onSubmit={ handleSubmit } style={ styles.loginForm }>
                <h2>Staff Login</h2>
                <input 
                    type="email" 
                    placeholder="Correo" 
                    required 
                    style={ styles.input }
                    onChange={ e => setCredentials( { ...credentials, email: e.target.value }) }
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    required 
                    style={ styles.input }
                    onChange={ e => setCredentials( { ...credentials, password: e.target.value }) }
                />
                <button type="submit" disabled={ loading } style={ styles.button }>
                    { loading ? 'Entrando...' : 'Iniciar Sesión' }
                </button>
            </form>
        </div>
    );
};

const styles = {
    loginWrapper: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f0f2f5' 
    },
    loginForm: { 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        width: '320px' 
    },
    input: { 
        width: '100%', 
        padding: '12px', 
        marginBottom: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '5px', 
        boxSizing: 'border-box' as 'border-box' 
    },
    button: { 
        width: '100%', 
        padding: '12px', 
        background: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer' 
    }
};

export default Login;