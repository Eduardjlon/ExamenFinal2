import readlineSync = require('readline-sync');
import { Usuario } from './interfaces/usuario.interface';
const fs = require('fs');

class GestorUsuarios {
    private usuarios: Usuario[];

    constructor() {
        this.usuarios = this.cargarUsuarios();
    }

    private cargarUsuarios(): Usuario[] {
        try {
            const usuariosData = fs.readFileSync('data/usuarios.json', 'utf-8');
            return JSON.parse(usuariosData);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    public registrarUsuario(usuario: Usuario): void {
        // Verificamos si ya existe un usuario con el mismo correo
        const usuarioExistente = this.usuarios.find(user => user.correo === usuario.correo);
        if (usuarioExistente) {
            console.log('Ya existe un usuario con este correo.');
            return;
        }

        // Generamos un nuevo ID para el usuario
        const nuevoId = this.usuarios.length > 0 ? this.usuarios[this.usuarios.length - 1].id_usuario + 1 : 1;
        usuario.id_usuario = nuevoId;

        // Agregamos el nuevo usuario al array
        this.usuarios.push(usuario);

        // Guardamos los usuarios actualizados en el archivo JSON
        this.guardarUsuarios();

        console.log('Usuario registrado correctamente.');
    }

    private guardarUsuarios(): void {
        try {
            fs.writeFileSync('data/usuarios.json', JSON.stringify(this.usuarios, null, 2));
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
        }
    }
}

const gestorUsuarios = new GestorUsuarios();

function registrarUsuario(): void {
    console.log('--- Registro de Nuevo Usuario ---');

    const nombre = readlineSync.question('Nombre: ');
    const carnet = parseInt(readlineSync.question('Carnet: '));
    const correo = readlineSync.question('Correo electrónico: ');
    const clave = readlineSync.question('Contraseña: ', { hideEchoBack: true });

    const nuevoUsuario: Usuario = {
        id_usuario: 0, // Se asignará automáticamente al registrar el usuario
        nombre,
        carnet,
        correo,
        clave
    };

    gestorUsuarios.registrarUsuario(nuevoUsuario);
}

// Menú principal
function mostrarMenu(): void {
    console.log('\n--- Menú Principal ---');
    console.log('1. Registrar Nuevo Usuario');
    console.log('0. Salir');

    const opcion = parseInt(readlineSync.question('Seleccione una opción: '));

    switch (opcion) {
        case 1:
            registrarUsuario();
            break;
        case 0:
            console.log('Saliendo del programa...');
            process.exit(0);
            break;
        default:
            console.log('Opción no válida. Por favor, seleccione una opción válida.');
            break;
    }

    // Mostramos el menú nuevamente después de ejecutar la opción seleccionada
    mostrarMenu();
}

// Iniciar la aplicación mostrando el menú principal
mostrarMenu();
