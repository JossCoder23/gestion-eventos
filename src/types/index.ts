export interface ApiResponse {
    status: string;
    message: string;
    es_primera_vez?: boolean;
    participante?: string;
}

export interface PuntoInteraccion {
    id: number;
    nombre: string;
}

export interface User {
    id: number;
    nombres: string;
    email: string;
    role: 'admin' | 'superadmin';
}

export interface LoginResponse {
    status: string;
    user: User;
    message?: string;
}

export interface Participante {
    nombres:string;
    taller_id:number;
    nro_documento:string;
}
