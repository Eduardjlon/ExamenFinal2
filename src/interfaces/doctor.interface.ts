import { Horario } from './horario.interface'

interface Doctor {
    id_doctor: number
    nombre: string
    especialidad: 'Odontología' | 'Cirujano Oral'
    horario: Horario
}
