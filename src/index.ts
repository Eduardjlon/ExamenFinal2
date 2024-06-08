import * as readline from 'readline';
import * as fs from 'fs';

interface Usuario {
    id_usuario: number;
    nombre: string;
    carnet: number;
    correo: string;
    clave: string;
    habilitado: boolean;
    rol: string;
}

interface Paciente {
    id_paciente: number;
    nombre: string;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
    alergias: string[];
    medicamentos: string[];
    condiciones: string[];
}

interface Doctor {
    id_doctor: number;
    nombre: string;
    especialidad: string;
}

interface Horario {
    id_horario: number;
    id_doctor: number;
    dia: string;
    horaInicio: string;
    horaFin: string;
}

interface Cita {
    id_cita: number;
    id_paciente: number;
    id_doctor: number;
    fecha: string;
    hora: string;
    servicio: string;
}

interface Receta {
    id_receta: number;
    id_paciente: number;
    id_doctor: number;
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    fecha: string;
}

interface ProductoServicio {
    id_producto: number;
    nombre: string;
    tipo: 'producto' | 'servicio';
    precio: number;
}

interface Factura {
    id_factura: number;
    id_cita: number;
    servicios: string[];
    productos: string[];
    total: number;
}

interface Historial {
    id_paciente: number;
    recetas: Receta[];
}

let usuarioActual: Usuario | null = null; // Variable para mantener la sesión actual

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
    const rol = await question('Ingrese el rol del usuario (Doctor/Paciente): ');

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
        clave,
        habilitado: true,
        rol
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
    console.log('Habilitado:', usuario.habilitado ? 'Sí' : 'No');
    console.log('Rol:', usuario.rol);
}

// Iniciar sesión
async function iniciarSesion(): Promise<void> {
    if (usuarioActual) {
        console.log(`Ya hay una sesión activa con el usuario: ${usuarioActual.nombre}. Debe desautenticarla primero.`);
        mostrarMenu();
        return;
    }

    const usuarios = cargarUsuarios();
    let usuario: Usuario | undefined = undefined;

    do {
        const correo = await question('Ingrese su correo: ');
        const clave = await question('Ingrese su clave: ');

        usuario = usuarios.find(user => user.correo === correo && user.clave === clave);

        if (!usuario) {
            console.log('Correo o clave incorrectos. Por favor, inténtelo de nuevo.\n');
        } else if (!usuario.habilitado) {
            const respuesta = await question(`El usuario ${usuario.nombre} está deshabilitado. ¿Desea habilitarlo? (S/N): `);
            if (respuesta.toLowerCase() === 's') {
                const correoConfirmacion = await question('Ingrese nuevamente su correo para habilitar: ');
                const claveConfirmacion = await question('Ingrese nuevamente su clave para habilitar: ');

                if (correoConfirmacion === usuario.correo && claveConfirmacion === usuario.clave) {
                    usuario.habilitado = true;
                    guardarUsuarios(usuarios);
                    console.log(`El usuario ${usuario.nombre} ha sido habilitado.`);
                } else {
                    console.log('Credenciales incorrectas. No se pudo habilitar el usuario.');
                    usuario = undefined;
                }
            } else {
                usuario = undefined;
            }
        }
    } while (!usuario);

    if (usuario) {
        usuarioActual = usuario;
        console.log(`¡Bienvenido, ${usuario.nombre}! Has iniciado sesión exitosamente.\n`);
    }
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

// Deshabilitar un usuario existente, lo desactiva no lo borra, creo que no lo solicita o no se leer.
async function deshabilitarUsuario(): Promise<void> {
    const usuarios = cargarUsuarios();

    const correo = await question('Ingrese el correo del usuario que desea deshabilitar: ');
    const clave = await question('Ingrese la clave del usuario: ');

    const usuario = usuarios.find(user => user.correo === correo && user.clave === clave);
    if (usuario) {
        const confirmar = await question('¿Está seguro de que desea deshabilitar este usuario? (S/N): ');
        if (confirmar.toLowerCase() === 's') {
            usuario.habilitado = false;
            guardarUsuarios(usuarios);
            console.log(`El usuario ${usuario.nombre} ha sido deshabilitado.`);
        }
    } else {
        console.log('Usuario no encontrado o credenciales incorrectas.');
    }
    mostrarMenu();
}

// Desautenticar (cerrar sesión) del usuario actual
function desautenticarUsuario(): void {
    if (usuarioActual) {
        console.log(`El usuario ${usuarioActual.nombre} ha cerrado sesión.`);
        usuarioActual = null;
    } else {
        console.log('No hay ninguna sesión activa.');
    }
    mostrarMenu(); // Volver al menú principal
}
// deberia carga los pacientes desde el .json para la funcion "13", no se porque no funciona, si alguien lo puede corregir porfi xdxd
function cargarPacientes(): Paciente[] {
    try {
        const pacientesData = fs.readFileSync('data/pacientes.json', 'utf-8');
        return JSON.parse(pacientesData);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        return [];
    }
}

// Guardar los pacientes en el archivo pacientes.json
function guardarPacientes(pacientes: Paciente[]): void {
    try {
        fs.writeFileSync('data/pacientes.json', JSON.stringify(pacientes, null, 2));
    } catch (error) {
        console.error('Error al guardar pacientes:', error);
    }
}

// Registrar un nuevo paciente
async function registrarPaciente(): Promise<void> {
    const pacientes = cargarPacientes();

    const nombre = await question('Ingrese el nombre del paciente: ');
    const fechaNacimiento = await question('Ingrese la fecha de nacimiento del paciente (YYYY-MM-DD): ');
    const direccion = await question('Ingrese la dirección del paciente: ');
    const telefono = await question('Ingrese el número de teléfono del paciente: ');
    const alergias = (await question('Ingrese las alergias del paciente: ')).split(',').map(a => a.trim());
    const medicamentos = (await question('Ingrese los medicamentos actuales del paciente: ')).split(',').map(m => m.trim());
    const condiciones = (await question('Ingrese las condiciones médicas preexistentes del paciente: ')).split(',').map(c => c.trim());

    const nuevoId = pacientes.length > 0 ? pacientes[pacientes.length - 1].id_paciente + 1 : 1;
    const nuevoPaciente: Paciente = {
        id_paciente: nuevoId,
        nombre,
        fechaNacimiento,
        direccion,
        telefono,
        alergias,
        medicamentos,
        condiciones
    };

    pacientes.push(nuevoPaciente);
    guardarPacientes(pacientes);
    console.log('Paciente registrado correctamente.');

    mostrarMenu();
}

// Cargar doctores desde el archivo doctores.json
function cargarDoctores(): Doctor[] {
    try {
        const doctoresData = fs.readFileSync('data/doctores.json', 'utf-8');
        return JSON.parse(doctoresData);
    } catch (error) {
        console.error('Error al cargar doctores:', error);
        return [];
    }
}

// Guardar los doctores en el archivo doctores.json
function guardarDoctores(doctores: Doctor[]): void {
    try {
        fs.writeFileSync('data/doctores.json', JSON.stringify(doctores, null, 2));
    } catch (error) {
        console.error('Error al guardar doctores:', error);
    }
}

// Registrar un nuevo doctor
async function registrarDoctor(): Promise<void> {
    const doctores = cargarDoctores();

    const nombre = await question('Ingrese el nombre del doctor: ');
    const especialidad = await question('Ingrese la especialidad del doctor: ');

    const nuevoId = doctores.length > 0 ? doctores[doctores.length - 1].id_doctor + 1 : 1;
    const nuevoDoctor: Doctor = {
        id_doctor: nuevoId,
        nombre,
        especialidad
    };

    doctores.push(nuevoDoctor);
    guardarDoctores(doctores);
    console.log('Doctor registrado correctamente.');

    mostrarMenu();
}

// Cargar horarios desde el archivo horarios.json
function cargarHorarios(): Horario[] {
    try {
        const horariosData = fs.readFileSync('data/horarios.json', 'utf-8');
        return JSON.parse(horariosData);
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        return [];
    }
}

// Guardar los horarios en el archivo horarios.json
function guardarHorarios(horarios: Horario[]): void {
    try {
        fs.writeFileSync('data/horarios.json', JSON.stringify(horarios, null, 2));
    } catch (error) {
        console.error('Error al guardar horarios:', error);
    }
}

// Registrar un nuevo horario para un doctor
async function registrarHorario(): Promise<void> {
    const horarios = cargarHorarios();
    const doctores = cargarDoctores();

    console.log('Doctores disponibles:');
    doctores.forEach(doctor => {
        console.log(`ID: ${doctor.id_doctor}, Nombre: ${doctor.nombre}, Especialidad: ${doctor.especialidad}`);
    });

    const idDoctor = parseInt(await question('Ingrese el ID del doctor: '));
    const dia = await question('Ingrese el día (ej. Lunes): ');
    const horaInicio = await question('Ingrese la hora de inicio (HH:MM): ');
    const horaFin = await question('Ingrese la hora de fin (HH:MM): ');

    const nuevoId = horarios.length > 0 ? horarios[horarios.length - 1].id_horario + 1 : 1;
    const nuevoHorario: Horario = {
        id_horario: nuevoId,
        id_doctor: idDoctor,
        dia,
        horaInicio,
        horaFin
    };

    horarios.push(nuevoHorario);
    guardarHorarios(horarios);
    console.log('Horario registrado correctamente.');

    mostrarMenu();
}

// Cargar citas desde el archivo citas.json
function cargarCitas(): Cita[] {
    try {
        const citasData = fs.readFileSync('data/citas.json', 'utf-8');
        return JSON.parse(citasData);
    } catch (error) {
        console.error('Error al cargar citas:', error);
        return [];
    }
}

// Guardar las citas en el archivo citas.json
function guardarCitas(citas: Cita[]): void {
    try {
        fs.writeFileSync('data/citas.json', JSON.stringify(citas, null, 2));
    } catch (error) {
        console.error('Error al guardar citas:', error);
    }
}

// Programar una nueva cita
async function programarCita(): Promise<void> {
    const citas = cargarCitas();
    const pacientes = cargarPacientes();
    const doctores = cargarDoctores();

    console.log('Pacientes disponibles:');
    pacientes.forEach(paciente => {
        console.log(`ID: ${paciente.id_paciente}, Nombre: ${paciente.nombre}`);
    });

    const idPaciente = parseInt(await question('Ingrese el ID del paciente: '));

    console.log('Doctores disponibles:');
    doctores.forEach(doctor => {
        console.log(`ID: ${doctor.id_doctor}, Nombre: ${doctor.nombre}, Especialidad: ${doctor.especialidad}`);
    });

    const idDoctor = parseInt(await question('Ingrese el ID del doctor: '));
    const fecha = await question('Ingrese la fecha de la cita (YYYY-MM-DD): ');
    const hora = await question('Ingrese la hora de la cita (HH:MM): ');
    const servicio = await question('Ingrese el servicio solicitado: ');

    const nuevoId = citas.length > 0 ? citas[citas.length - 1].id_cita + 1 : 1;
    const nuevaCita: Cita = {
        id_cita: nuevoId,
        id_paciente: idPaciente,
        id_doctor: idDoctor,
        fecha,
        hora,
        servicio
    };

    citas.push(nuevaCita);
    guardarCitas(citas);
    console.log('Cita programada correctamente.');

    mostrarMenu();
}

// Cargar productos y servicios desde el archivo productos_servicios.json
function cargarProductosServicios(): ProductoServicio[] {
    try {
        const productosServiciosData = fs.readFileSync('data/productos_servicios.json', 'utf-8');
        return JSON.parse(productosServiciosData);
    } catch (error) {
        console.error('Error al cargar productos y servicios:', error);
        return [];
    }
}

// Guardar los productos y servicios en el archivo productos_servicios.json
function guardarProductosServicios(productosServicios: ProductoServicio[]): void {
    try {
        fs.writeFileSync('data/productos_servicios.json', JSON.stringify(productosServicios, null, 2));
    } catch (error) {
        console.error('Error al guardar productos y servicios:', error);
    }
}

// Registrar un nuevo producto o servicio
async function registrarProductoServicio(): Promise<void> {
    const productosServicios = cargarProductosServicios();

    const nombre = await question('Ingrese el nombre del producto o servicio: ');
    const tipo = await question('Ingrese el tipo (producto/servicio): ') as 'producto' | 'servicio';
    const precio = parseFloat(await question('Ingrese el precio: '));

    const nuevoId = productosServicios.length > 0 ? productosServicios[productosServicios.length - 1].id_producto + 1 : 1;
    const nuevoProductoServicio: ProductoServicio = {
        id_producto: nuevoId,
        nombre,
        tipo,
        precio
    };

    productosServicios.push(nuevoProductoServicio);
    guardarProductosServicios(productosServicios);
    console.log('Producto o servicio registrado correctamente.');

    mostrarMenu();
}

// Cargar historiales desde el archivo historiales.json
function cargarHistoriales(): Historial[] {
    try {
        const historialesData = fs.readFileSync('data/recetas.json', 'utf-8');
        return JSON.parse(historialesData);
    } catch (error) {
        console.error('Error al cargar historiales:', error);
        return [];
    }
}

// pasen un formulario para fisica porfa
function guardarHistoriales(recetas: Historial[]): void {
    try {
        fs.writeFileSync('data/recetas.json', JSON.stringify(recetas, null, 2));
    } catch (error) {
        console.error('Error al guardar recetas:', error);
    }
}

// Registrar una nueva receta
async function registrarReceta(): Promise<void> {
    const recetas = cargarHistoriales();
    const pacientes = cargarPacientes();
    const doctores = cargarDoctores();

    console.log('Pacientes disponibles:');
    pacientes.forEach(paciente => {
        console.log(`ID: ${paciente.id_paciente}, Nombre: ${paciente.nombre}`);
    });

    const idPaciente = parseInt(await question('Ingrese el ID del paciente: '));

    console.log('Doctores disponibles:');
    doctores.forEach(doctor => {
        console.log(`ID: ${doctor.id_doctor}, Nombre: ${doctor.nombre}, Especialidad: ${doctor.especialidad}`);
    });

    const idDoctor = parseInt(await question('Ingrese el ID del doctor: '));
    const medicamento = await question('Ingrese el nombre del medicamento: ');
    const dosis = await question('Ingrese la dosis: ');
    const frecuencia = await question('Ingrese la frecuencia: ');
    const duracion = await question('Ingrese la duración del tratamiento: ');
    const fecha = new Date().toISOString().split('T')[0];

    const nuevoId = recetas.length > 0 ? recetas[recetas.length - 1].id_paciente + 1 : 1;
    const nuevaReceta: Receta = {
        id_receta: nuevoId,
        id_paciente: idPaciente,
        id_doctor: idDoctor,
        medicamento,
        dosis,
        frecuencia,
        duracion,
        fecha
    };

    let historial = recetas.find(historial => historial.id_paciente === idPaciente);
    if (!historial) {
        historial = {
            id_paciente: idPaciente,
            recetas: []
        };
        recetas.push(historial);
    }
    historial.recetas.push(nuevaReceta);
    guardarHistoriales(recetas);
    console.log('Receta registrada correctamente.');

    mostrarMenu();
}
// Mostrar los datos de un paciente
function mostrarDatosPaciente(paciente: Paciente): void {
    console.log('\n--- Datos Registrados del Paciente ---');
    console.log('ID de Paciente:', paciente.id_paciente);
    console.log('Nombre:', paciente.nombre);
    console.log('Fecha de Nacimiento:', paciente.fechaNacimiento);
    console.log('Dirección:', paciente.direccion);
    console.log('Teléfono:', paciente.telefono);
    console.log('Alergias:', paciente.alergias.join(', '));
    console.log('Medicamentos:', paciente.medicamentos.join(', '));
    console.log('Condiciones Médicas:', paciente.condiciones.join(', '));
}
function verTodosLosPacientes(): void {
    const pacientes = cargarPacientes();
    if (pacientes.length === 0) {
        console.log('No hay pacientes registrados.');
    } else {
        pacientes.forEach(mostrarDatosPaciente);
    }
    mostrarMenu();
}

// Cargar facturas desde el archivo facturas.json
function cargarFacturas(): Factura[] {
    try {
        const facturasData = fs.readFileSync('data/facturas.json', 'utf-8');
        return JSON.parse(facturasData);
    } catch (error) {
        console.error('Error al cargar facturas:', error);
        return [];
    }
}

// Guardar las facturas en el archivo facturas.json
function guardarFacturas(facturas: Factura[]): void {
    try {
        fs.writeFileSync('data/facturas.json', JSON.stringify(facturas, null, 2));
    } catch (error) {
        console.error('Error al guardar facturas:', error);
    }
}

// Generar una nueva factura
async function generarFactura(): Promise<void> {
    const facturas = cargarFacturas();
    const citas = cargarCitas();
    const productosServicios = cargarProductosServicios();

    console.log('Citas disponibles:');
    citas.forEach(cita => {
        console.log(`ID: ${cita.id_cita}, Paciente ID: ${cita.id_paciente}, Doctor ID: ${cita.id_doctor}, Fecha: ${cita.fecha}, Hora: ${cita.hora}, Servicio: ${cita.servicio}`);
    });

    const idCita = parseInt(await question('Ingrese el ID de la cita: '));

    const cita = citas.find(cita => cita.id_cita === idCita);
    if (!cita) {
        console.log('Cita no encontrada.');
        mostrarMenu();
        return;
    }

    const serviciosConsumidos = [cita.servicio];
    const productosConsumidos = (await question('Ingrese los productos consumidos: ')).split(',').map(p => p.trim());

    const totalServicios = serviciosConsumidos.reduce((total, servicio) => {
        const productoServicio = productosServicios.find(ps => ps.nombre === servicio && ps.tipo === 'servicio');
        return total + (productoServicio ? productoServicio.precio : 0);
    }, 0);

    const totalProductos = productosConsumidos.reduce((total, producto) => {
        const productoServicio = productosServicios.find(ps => ps.nombre === producto && ps.tipo === 'producto');
        return total + (productoServicio ? productoServicio.precio : 0);
    }, 0);

    const total = totalServicios + totalProductos;

    const nuevoId = facturas.length > 0 ? facturas[facturas.length - 1].id_factura + 1 : 1;
    const nuevaFactura: Factura = {
        id_factura: nuevoId,
        id_cita: idCita,
        servicios: serviciosConsumidos,
        productos: productosConsumidos,
        total
    };

    facturas.push(nuevaFactura);
    guardarFacturas(facturas);
    console.log('Factura generada correctamente.');
    console.log(`Total a pagar: Q.${total}`);

    mostrarMenu();
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función auxiliar para obtener la entrada del usuario
function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

// Mostrar el menú principal
async function mostrarMenu(): Promise<void> {
    console.log('\n--- Sistema de Gestión Clínica Dental ---');
    console.log('1. Registrarse'); //Solicita si se esta registrando un paciente o un doctor, pero no se si puede llegar a complicar las cosas
    console.log('2. Iniciar sesión');
    console.log('3. Editar usuario');
    console.log('4. Deshabilitar usuario');
    console.log('5. Desautenticar usuario');
    console.log('6. Registrar paciente'); //Podemos usar estos dos cosos para ver todos los paciente y doctores (6-7)
    console.log('7. Registrar doctor');
    console.log('8. Registrar horario de doctor');
    console.log('9. Programar cita');
    console.log('10. Registrar producto o servicio');
    console.log('11. Registrar receta');
    console.log('12. Generar factura');
    console.log('13. Ver registro de pacientes')
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
        case '4':
            await deshabilitarUsuario();
            break;
        case '5':
            desautenticarUsuario();
            break;
        case '6':
            await registrarPaciente();
            break;
        case '7':
            await registrarDoctor();
            break;
        case '8':
            await registrarHorario();
            break;
        case '9':
            await programarCita();
            break;
        case '10':
            await registrarProductoServicio();
            break;
        case '11':
            await registrarReceta();
            break;
        case '12':
            await generarFactura();
            break;
        case '13':
            verTodosLosPacientes();
            break;
        case '0':
            rl.close();
            return;
        default:
            console.log('Opción no válida. Por favor, seleccione una opción válida.');
            mostrarMenu();
            break;
    }
}
// Hay que arreglar el coso para precios, no jala xd
// Las recetas si se crean y se guardan en "Recetas5.json" hay que crear la funcion de ver las recetas creadas

mostrarMenu();
