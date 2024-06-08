export interface Usuario {
    id_usuario: number;
    nombre: string;
    carnet: number;
    correo: string;
    clave: string;
    habilitado: boolean; // Nuevo campo para indicar si el usuario está habilitado
}
