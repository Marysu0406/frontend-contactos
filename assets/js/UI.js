export class UI {
    mostrarContactos(contactos) {
        const tabla = document.getElementById('tabla-contactos');
        tabla.innerHTML = ''; 

        contactos.forEach(contacto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="ps-5 py-4 fw-semibold text-dark">${contacto.nombre}</td>
                <td><i class="fa-solid fa-phone text-muted me-2"></i>${contacto.telefono}</td>
                <td><i class="fa-solid fa-envelope text-muted me-2"></i>${contacto.email}</td>
                <td><i class="fa-solid fa-calendar-days text-muted me-2"></i>${contacto.fecha_nacimiento}</td>
                <td><span class="badge-category">${contacto.categoria}</span></td>
                <td class="text-center pe-5">
                    <button class="btn-action btn-edit" data-id="${contacto.id}" data-bs-toggle="modal" data-bs-target="#modalContacto">
                        <i class="fa-solid fa-pen" style="pointer-events: none;"></i>
                    </button>
                    <button class="btn-action btn-delete" data-id="${contacto.id}">
                        <i class="fa-solid fa-trash" style="pointer-events: none;"></i>
                    </button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    }

    limpiarFormulario() {
        document.getElementById('formulario-contacto').reset();
        document.getElementById('id-contacto').value = ''; 
    }
}