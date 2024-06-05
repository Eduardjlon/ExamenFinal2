export interface Factura {
    id_factura: number
    fecha_hora: Date
    id_paciente: number
    id_doctor: number
    servicios_consumidos: number[]
    total: number
}