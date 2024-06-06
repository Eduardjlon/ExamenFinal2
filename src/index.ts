// Importaciones necesarias
import readline = require('readline');
import fs = require('fs');

// Definición de la interfaz Usuario
interface Usuario {
    id_usuario: number;
    nombre: string;
    carnet: number;
    correo: string;
    clave: string;
}

// Clase GestorUsuarios para manejar la lógica relacionada con los usuarios
class GestorUsuarios {
    private usuarios: Usuario[];

    // Constructor para cargar usuarios desde el archivo al iniciar la aplicación
    constructor() {
        this.usuarios = this.cargarUsuarios();
    }

    // Método para cargar usuarios desde el archivo usuarios.json
    private cargarUsuarios(): Usuario[] {
        try {
            const usuariosData = fs.readFileSync('data/usuarios.json', 'utf-8');
            return JSON.parse(usuariosData);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    // Método para registrar un nuevo usuario
    public registrarUsuario(usuario: Usuario): void {
        // Verificar si el correo ya está registrado
        const usuarioExistente = this.usuarios.find(user => user.correo === usuario.correo);
        if (usuarioExistente) {
            console.log('Ya existe un usuario con este correo.');
            return;
        }

        // Generar un nuevo ID para el usuario
        const nuevoId = this.usuarios.length > 0 ? this.usuarios[this.usuarios.length - 1].id_usuario + 1 : 1;
        usuario.id_usuario = nuevoId;

        // Agregar el nuevo usuario al array de usuarios
        this.usuarios.push(usuario);

        // Guardar los usuarios actualizados en el archivo JSON
        this.guardarUsuarios();

        console.log('Usuario registrado correctamente.');

        // Preguntar si el usuario desea ver sus datos registrados
        question('¿Desea ver sus datos registrados? (S/N): ').then(respuesta => {
            if (respuesta.toLowerCase() === 's') {
                console.log('\n--- Datos Registrados ---');
                this.mostrarDatosUsuario(usuario);
            }
            mostrarMenu();
        });
    }

    // Método para mostrar los datos de un usuario
    private mostrarDatosUsuario(usuario: Usuario): void {
        console.log('ID de Usuario:', usuario.id_usuario);
        console.log('Nombre:', usuario.nombre);
        console.log('Carnet:', usuario.carnet);
        console.log('Correo:', usuario.correo);
        console.log('Clave:', usuario.clave);
    }

    // Método para guardar los usuarios en el archivo usuarios.json
    private guardarUsuarios(): void {
        try {
            fs.writeFileSync('data/usuarios.json', JSON.stringify(this.usuarios, null, 2));
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
        }
    }

    // Método para iniciar sesión
    public iniciarSesion(correo: string, clave: string): Usuario | null {
        const usuario = this.usuarios.find(user => user.correo === correo && user.clave === clave);
        return usuario ? usuario : null;
    }

    // Método para editar un usuario existente
    public async editarUsuario(correo: string, clave: string): Promise<void> {
        const usuario = this.usuarios.find(user => user.correo === correo && user.clave === clave);
        if (usuario) {
            console.log(`Usuario encontrado.\nDatos actuales:`);
            this.mostrarDatosUsuario(usuario);

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
                    break;
            }

            const guardarCambios = await question('¿Desea guardar los cambios? (S/N): ');
            if (guardarCambios.toLowerCase() === 's') {
                this.guardarUsuarios();
                console.log('Los cambios han sido guardados correctamente.');
            }
        } else {
            console.log('Usuario no encontrado.');
        }
        mostrarMenu(); // Volver al menú principal
    }
}

// Función para limpiar la pantalla
function limpiarPantalla(): void {
    // Limpiar la pantalla imprimiendo caracteres de retorno de carro
    process.stdout.write('\x1B[2J\x1B[0f');
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
            break;
    }
}


// Función para leer la entrada del usuario
function question(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer: string) => {
            rl.close(); // Cerrar el flujo de entrada y salida estándar después de recibir la respuesta
            resolve(answer.trim());
        });
    });
}




// Función para registrar un nuevo usuario
async function registrarUsuario(): Promise<void> {
    const gestorUsuarios = new GestorUsuarios();

    const nombre = await question('Ingrese el nombre del usuario: ');
    const carnet = parseInt(await question('Ingrese el carnet del usuario: '));
    const correo = await question('Ingrese el correo del usuario: ');
    const clave = await question('Ingrese la clave del usuario: ');

    const nuevoUsuario: Usuario = {
        id_usuario: 0, // El ID se generará automáticamente
        nombre,
        carnet,
        correo,
        clave
    };

    gestorUsuarios.registrarUsuario(nuevoUsuario);
}

// Función para iniciar sesión
async function iniciarSesion(): Promise<void> {
    const gestorUsuarios = new GestorUsuarios();

    let usuario: Usuario | null = null;
    do {
        const correo = await question('Ingrese su correo: ');
        const clave = await question('Ingrese su clave: ');

        usuario = gestorUsuarios.iniciarSesion(correo, clave);

        if (!usuario) {
            console.log('Correo o clave incorrectos. Por favor, inténtelo de nuevo.\n');
        }
    } while (!usuario);

    console.log(`¡Bienvenido, ${usuario.nombre}! Has iniciado sesión exitosamente.\n`);
    mostrarMenu(); // Llamada a mostrarMenu después de iniciar sesión
}

// Función para editar un usuario existente
async function editarUsuario(): Promise<void> {
    const gestorUsuarios = new GestorUsuarios();

    const correo = await question('Ingrese su correo: ');
    const clave = await question('Ingrese su clave: ');

    await gestorUsuarios.editarUsuario(correo, clave);
}

// Función cprincipal
async function main(): Promise<void> {
    console.log('Bienvenido a la aplicación de gestión de clínica dental.');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Ciclo principal
    while (true) {
        await mostrarMenu();
        rl.prompt(); // Volver a mostrar el prompt para el siguiente input
    }
}

// Ejecutar la función principal
main().catch(error => console.error(error));



