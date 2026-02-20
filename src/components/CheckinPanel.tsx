import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import type { Participante, PuntoInteraccion, ApiResponse } from '../types';

const CheckinPanel: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    
    // Consumimos el estado global de Zustand
    const { user, puntoId, setPuntoId } = useAuthStore();
    
    const [participante, setParticipante] = useState<Participante | null>(null);
    const [puntos, setPuntos] = useState<PuntoInteraccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [inputZebra, setInputZebra] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Cargar info inicial y puntos
    useEffect(() => {
        if (uuid) {
            api.get(`/v1/public/participante/${uuid}`)
                .then(res => setParticipante(res.data))
                .catch(() => setMensaje("Participante no encontrado"));
        }

        if (user) {
            api.get('/v1/interacciones/puntos').then(res => setPuntos(res.data));
        }
    }, [uuid, user]);

    // 2. Mantener el foco para la pistola Zebra si el admin está logueado
    useEffect(() => {
        if (user) {
            const keepFocus = () => inputRef.current?.focus();
            document.addEventListener('click', keepFocus);
            keepFocus();
            return () => document.removeEventListener('click', keepFocus);
        }
    }, [user]);

    const registrarIngreso = async (targetUuid?: string, dniManual?: string) => {
        const idToProcess = targetUuid || uuid;
        const puntoActivo = puntoId;

        if (!puntoActivo) return alert("Por favor, selecciona primero tu punto de control.");
        
        setLoading(true);
        try {
            // Decidir endpoint: si hay DNI manual usamos ese, si no el UUID
            const endpoint = dniManual ? '/v1/checkin/dni' : `/v1/checkin/qr/${idToProcess}`;
            const payload = dniManual ? { dni: dniManual, punto_interaccion_id: puntoActivo } : { punto_interaccion_id: puntoActivo };

            const { data } = await api.post<ApiResponse>(endpoint, payload);
            alert(`¡Éxito! ${data.participante} registrado.`);
            
            if (targetUuid) navigate('/'); // Limpiar URL tras éxito
        } catch (e: any) {
            alert(e.response?.data?.message || "Error en el registro");
        } finally {
            setLoading(false);
            setInputZebra("");
        }
    };

    // Procesar entrada de la Zebra
    const handleZebraSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputZebra) return;

        // Detectar si es una URL (QR) o DNI
        if (inputZebra.includes('-') || inputZebra.includes('http')) {
            const extractedUuid = inputZebra.split('/').pop() || "";
            registrarIngreso(extractedUuid);
        } else {
            registrarIngreso(undefined, inputZebra);
        }
    };

    if (!participante && !mensaje && uuid) return <p>Cargando información...</p>;

    return (
        <div className="container">
            {/* INPUT INVISIBLE / PERSISTENTE PARA ZEBRA (Solo Admin) */}
            {user && (
                <form onSubmit={handleZebraSubmit} style={{ position: 'absolute', opacity: 0, height: 0 }}>
                    <input 
                        ref={inputRef}
                        value={inputZebra}
                        onChange={(e) => setInputZebra(e.target.value)}
                        autoFocus 
                    />
                </form>
            )}

            <div className="info-card">
                <h1>{participante ? `¡Hola, ${participante.nombres}!` : "Bienvenido"}</h1>
                {participante ? (
                    <div className="user-data">
                        <p><strong>DNI:</strong> {participante.nro_documento}</p>
                        <p><strong>Taller:</strong> {participante.taller_id || 'General'}</p>
                    </div>
                ) : (
                    <p>Escanee un código o ingrese sus datos para continuar.</p>
                )}
            </div>

            {user ? (
                <div className="admin-controls">
                    <h3>Control de Acceso (Admin)</h3>
                    <div className="field">
                        <label>Punto de Control:</label>
                        <select 
                            value={puntoId || ""} 
                            onChange={(e) => setPuntoId(Number(e.target.value))}
                        >
                            <option value="">-- Seleccionar --</option>
                            {puntos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    {uuid && (
                        <button 
                            onClick={() => registrarIngreso()} 
                            disabled={loading || !puntoId}
                            className="btn-checkin"
                        >
                            {loading ? "Registrando..." : "Confirmar Asistencia Manual"}
                        </button>
                    )}
                    
                    <p className="zebra-status">
                        {puntoId ? "🟢 Pistola Zebra lista para escanear" : "🔴 Selecciona un punto para activar escáner"}
                    </p>
                </div>
            ) : (
                <div className="login-notice">
                    <p>📅 Fecha: 20 de Mayo | 📍 Auditorio Principal</p>
                </div>
            )}

            <style>{`
                .container { max-width: 500px; margin: auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }
                .info-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; text-align: center; }
                .admin-controls { background: #f8fafc; padding: 20px; border-radius: 15px; border: 2px solid #e2e8f0; }
                .field { margin-bottom: 15px; }
                .btn-checkin { width: 100%; padding: 15px; background: #2563eb; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-checkin:hover { background: #1d4ed8; }
                .btn-checkin:disabled { background: #cbd5e1; cursor: not-allowed; }
                .zebra-status { font-size: 0.8rem; margin-top: 15px; text-align: center; color: #64748b; }
                select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 5px; }
            `}</style>
        </div>
    );
};

export default CheckinPanel;