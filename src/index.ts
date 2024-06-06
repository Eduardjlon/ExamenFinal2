// Importaciones necesarias
import * as readline from 'readline';
import * as fs from 'fs';
import { Usuario } from './interfaces/usuario.interface';

// Cargar usuarios desde el archivo usuarios.json
function cargarUsuarios(): Usuario[] {
    try {
        const usuariosData = fs.readFileSync('data/usuarios.json', 'utf-8');
        return JSON.parse(usuariosData);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        return [];
    }
}

// Guardar los usuarios en el archivo usuarios.json
function guardarUsuarios(usuarios: Usuario[]): void {
    try {
        fs.writeFileSync('data/usuarios.json', JSON.stringify(usuarios, null, 2));
    } catch (error) {
        console.error('Error al guardar usuarios:', error);
    }
}

// Registrar un nuevo usuario
async function registrarUsuario(): Promise<void> {
    const usuarios = cargarUsuarios();

    const nombre = await question('Ingrese el nombre del usuario: ');
    const carnet = parseInt(await question('Ingrese el carnet del usuario: '));
    const correo = await question('Ingrese el correo del usuario: ');
    const clave = await question('Ingrese la clave del usuario: ');

    const usuarioExistente = usuarios.find(user => user.correo === correo);
    if (usuarioExistente) {
        console.log('Ya existe un usuario con este correo.');
        return;
    }

    const nuevoId = usuarios.length > 0 ? usuarios[usuarios.length - 1].id_usuario + 1 : 1;
    const nuevoUsuario: Usuario = {
        id_usuario: nuevoId,
        nombre,
        carnet,
        correo,
        clave
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    console.log('Usuario registrado correctamente.');

    const respuesta = await question('¿Desea ver sus datos registrados? (S/N): ');
    if (respuesta.toLowerCase() === 's') {
        mostrarDatosUsuario(nuevoUsuario);
    }
    mostrarMenu();
}

// Mostrar los datos de un usuario
function mostrarDatosUsuario(usuario: Usuario): void {
    console.log('\n--- Datos Registrados ---');
    console.log('ID de Usuario:', usuario.id_usuario);
    console.log('Nombre:', usuario.nombre);
    console.log('Carnet:', usuario.carnet);
    console.log('Correo:', usuario.correo);
    console.log('Clave:', usuario.clave);
}

// Iniciar sesión
async function iniciarSesion(): Promise<void> {
    const usuarios = cargarUsuarios();
    let usuario: Usuario | undefined = undefined;

    do {
        const correo = await question('Ingrese su correo: ');
        const clave = await question('Ingrese su clave: ');

        usuario = usuarios.find(user => user.correo === correo && user.clave === clave);

        if (!usuario) {
            console.log('Correo o clave incorrectos. Por favor, inténtelo de nuevo.\n');
        }
    } while (!usuario);

    console.log(`¡Bienvenido, ${usuario.nombre}! Has iniciado sesión exitosamente.\n`);
    mostrarMenu();
}

// Editar un usuario existente
async function editarUsuario(): Promise<void> {
    const usuarios = cargarUsuarios();

    const correo = await question('Ingrese su correo: ');
    const clave = await question('Ingrese su clave: ');

    const usuario = usuarios.find(user => user.correo === correo && user.clave === clave);
    if (usuario) {
        console.log(`Usuario encontrado.\nDatos actuales:`);
        mostrarDatosUsuario(usuario);

        console.log('\nSeleccione el dato que desea editar:');
        console.log('1. Nombre');
        console.log('2. Carnet');
        console.log('3. Correo');
        console.log('4. Clave');
        console.log('5. Cancelar');

        const opcion = await question('Seleccione una opción: ');

        switch (opcion) {
            case '1':
                usuario.nombre = await question('Ingrese el nuevo nombre: ');
                break;
            case '2':
                usuario.carnet = parseInt(await question('Ingrese el nuevo carnet: '));
                break;
            case '3':
                usuario.correo = await question('Ingrese el nuevo correo: ');
                break;
            case '4':
                usuario.clave = await question('Ingrese la nueva clave: ');
                break;
            case '5':
                console.log('No se realizaron cambios.');
                mostrarMenu();
                return;
            default:
                console.log('Opción no válida. Por favor, seleccione una opción válida.');
                return;
        }

        const guardarCambios = await question('¿Desea guardar los cambios? (S/N): ');
        if (guardarCambios.toLowerCase() === 's') {
            guardarUsuarios(usuarios);
            console.log('Los cambios han sido guardados correctamente.');
        }
    } else {
        console.log('Usuario no encontrado.');
    }
    mostrarMenu(); // Volver al menú principal
}

// Función para leer la entrada del usuario
function question(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer: string) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Función para mostrar el menú principal
async function mostrarMenu(): Promise<void> {
    console.log('\n--- Menú Principal ---');
    console.log('1. Registrar Nuevo Usuario');
    console.log('2. Iniciar Sesión');
    console.log('3. Editar Usuario');
    console.log('0. Salir');

    const opcion = await question('Seleccione una opción: ');

    switch (opcion) {
        case '1':
            await registrarUsuario();
            break;
        case '2':
            await iniciarSesion();
            break;
        case '3':
            await editarUsuario();
            break;
        case '0':
            console.log('Saliendo del programa...');
            process.exit(0);
        default:
            console.log('Opción no válida. Por favor, seleccione una opción válida.');
            mostrarMenu();
            break;
    }
}

// Función principal
async function main(): Promise<void> {
    console.log('Bienvenido a la aplicación de gestión de clínica dental.');
    await mostrarMenu();
}

// Ejecutar la función principal
main().catch(error => console.error(error));
