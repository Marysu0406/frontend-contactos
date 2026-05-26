export class API {
    constructor() {
        this.baseURL = 'https://marysuarez.site/backend-contactos/backend-contactos/index.php';
    }

    // 1. Obtener contactos (Este funcionaba bien)
    async obtenerContactos() {
        const respuesta = await fetch(`${this.baseURL}?accion=contactos-completos`);
        return await respuesta.json();
    }

    // 2. Crear contacto (Tu PHP pedía "agregar-contacto-completo")
    async crearContacto(contacto) {
        const respuesta = await fetch(`${this.baseURL}?accion=agregar-contacto-completo`, {
            method: 'POST',
            body: JSON.stringify(contacto) // Aquí viaja nombre, apellido, fecha_nacimiento, id_categoria, telefono, correo
        });
        return await respuesta.json();
    }

    // 3. Actualizar contacto 
    async actualizarContacto(id, contacto) {
        // Tu PHP exige que el id_contacto vaya adentro del JSON, no en la URL
        contacto.id_contacto = id; 
        
        const respuesta = await fetch(`${this.baseURL}?accion=actualizar-contacto-completo`, {
            method: 'PUT',
            body: JSON.stringify(contacto)
        });
        return await respuesta.json();
    }

    // 4. Eliminar contacto
    async eliminarContacto(id) {
        // Tu PHP exige que el id_contacto vaya adentro del JSON
        const respuesta = await fetch(`${this.baseURL}?accion=eliminar-contacto`, {
            method: 'DELETE',
            body: JSON.stringify({ id_contacto: id })
        });
        return await respuesta.json();
    }
}