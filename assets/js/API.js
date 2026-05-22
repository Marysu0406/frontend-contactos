// Clase para manejar las peticiones a la base de datos en Hostinger
export class API {
    constructor() {
        // URL maestra de tu API en Hostinger que configuramos ayer
        this.baseURL = 'https://marysuarez.site/backend-contactos/backend-contactos/index.php';
    }

    // Método para traer todos los contactos (Petición GET)
    async obtenerContactos() {
        const respuesta = await fetch(`${this.baseURL}?accion=contactos-completos`);
        return await respuesta.json();
    }

    // Método para crear un nuevo contacto (Petición POST)
    async crearContacto(contacto) {
        const respuesta = await fetch(`${this.baseURL}?accion=crear-contacto`, {
            method: 'POST',
            body: JSON.stringify(contacto)
        });
        return await respuesta.json();
    }

    // Método para eliminar un contacto (Petición DELETE)
    async eliminarContacto(id) {
        const respuesta = await fetch(`${this.baseURL}?accion=eliminar-contacto&id=${id}`, {
            method: 'DELETE'
        });
        return await respuesta.json();
    }
}