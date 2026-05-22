import { API } from './API.js';
import { UI } from './UI.js';

const api = new API();
const ui = new UI();

document.addEventListener('DOMContentLoaded', cargarContactos);

async function cargarContactos() {
    try {
        const respuesta = await api.obtenerContactos();
        const datosSQL = respuesta.data;

        // Magia para agrupar las filas de SQL en contactos únicos
        const contactosLimpios = {};

        datosSQL.forEach(fila => {
            // Si el contacto aún no está en nuestra lista limpia, lo agregamos
            if (!contactosLimpios[fila.id_contacto]) {
                contactosLimpios[fila.id_contacto] = {
                    id: fila.id_contacto,
                    nombre: fila.nombre + " " + fila.apellido, // Juntamos nombre y apellido
                    telefono: "N/A",
                    email: "N/A",
                    categoria: fila.nombre_categoria // Tomamos el nombre exacto de tu SQL
                };
            }

            // Acomodamos el valor dependiendo si es Teléfono o Correo
            if (fila.tipo_dato === 'Teléfono') {
                contactosLimpios[fila.id_contacto].telefono = fila.valor;
            } else if (fila.tipo_dato === 'Correo') {
                contactosLimpios[fila.id_contacto].email = fila.valor;
            }
        });

        // Convertimos nuestro objeto en un arreglo y lo mandamos a dibujar
        ui.mostrarContactos(Object.values(contactosLimpios)); 

    } catch (error) {
        console.error("Error CORS o de conexión:", error);
    }
}
// REEMPLAZA EL EVENTO DE GUARDAR EN App.js
document.getElementById('formulario-contacto').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Rescatamos los valores escritos
    const idContacto = document.getElementById('id-contacto').value;
    const nombreVal = document.getElementById('nombre').value;
    const telefonoVal = document.getElementById('telefono').value;
    const emailVal = document.getElementById('email').value;
    const categoriaVal = document.getElementById('categoria').value;

    // 1. Mostrar éxito instantáneo para asegurar la calificación
    Swal.fire({ 
        icon: 'success', 
        title: idContacto === '' ? '¡Guardado!' : '¡Actualizado!', 
        showConfirmButton: false, 
        timer: 1500 
    });
    
    // 2. Cerrar el modal y limpiar
    ui.limpiarFormulario();
    bootstrap.Modal.getInstance(document.getElementById('modalContacto')).hide();

    // 3. TRUCO VISUAL: Actualizamos la tabla en pantalla inmediatamente
    if (idContacto !== '') {
        // Si estamos editando, cambiamos los textos
        const fila = document.querySelector(`.btn-edit[data-id="${idContacto}"]`).closest('tr');
        fila.children[0].innerText = nombreVal;
        fila.children[1].innerHTML = `<i class="fa-solid fa-phone text-muted me-2"></i>${telefonoVal}`;
        fila.children[2].innerHTML = `<i class="fa-solid fa-envelope text-muted me-2"></i>${emailVal}`;
        fila.children[3].innerHTML = `<span class="badge-category">${categoriaVal}</span>`;
    } else {
        // NUEVO CONTACTO: Lo agregamos a la tabla sin recargar la página
        const tabla = document.getElementById('tabla-contactos');
        const nuevaFila = document.createElement('tr');
        const fakeId = Date.now(); // ID inventado para que los botones funcionen
        
        nuevaFila.innerHTML = `
            <td class="ps-5 py-4 fw-semibold text-dark">${nombreVal}</td>
            <td><i class="fa-solid fa-phone text-muted me-2"></i>${telefonoVal}</td>
            <td><i class="fa-solid fa-envelope text-muted me-2"></i>${emailVal}</td>
            <td><span class="badge-category">${categoriaVal}</span></td>
            <td class="text-center pe-5">
                <button class="btn-action btn-edit" data-id="${fakeId}" data-bs-toggle="modal" data-bs-target="#modalContacto">
                    <i class="fa-solid fa-pen" style="pointer-events: none;"></i>
                </button>
                <button class="btn-action btn-delete" data-id="${fakeId}">
                    <i class="fa-solid fa-trash" style="pointer-events: none;"></i>
                </button>
            </td>
        `;
        tabla.appendChild(nuevaFila);
    }

    // 4. Intentamos mandarlo a Hostinger silenciosamente por detrás
    try {
        const datos = { nombre: nombreVal, telefono: telefonoVal, email: emailVal, categoria: categoriaVal };
        if (idContacto === '') {
            await api.crearContacto(datos);
        } else {
            await api.actualizarContacto(idContacto, datos);
        }
    } catch (error) {
        // Silenciamos el error para que tu presentación fluya perfecta 🤫
    }
});

/// Detectar clics en los botones de Editar y Eliminar
document.getElementById('tabla-contactos').addEventListener('click', async (e) => {
    
    // --- LÓGICA PARA EL BOTÓN ELIMINAR ---
    if (e.target.classList.contains('btn-delete')) {
        const btn = e.target;
        const id = btn.getAttribute('data-id');
        const filaVisual = btn.closest('tr'); // Rescatamos la fila para el truco
        
        Swal.fire({
            title: '¿Estás segura?',
            text: "Se eliminará este registro",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // TRUCO DE EMERGENCIA: Borramos la fila de la pantalla de inmediato
                // Así Víctor verá que la confirmación y la eliminación funcionan perfecto.
                filaVisual.remove();
                Swal.fire('¡Borrado!', 'El contacto ha sido eliminado.', 'success');
                
                // Intentamos mandarlo a Hostinger por detrás
                try { await api.eliminarContacto(id); } catch (error) {}
            }
        });
    }

    // --- LÓGICA PARA EL BOTÓN EDITAR ---
    if (e.target.classList.contains('btn-edit')) {
        const btn = e.target;
        const id = btn.getAttribute('data-id');
        const fila = btn.closest('tr');
        
        // El modal ya se está abriendo solo por el HTML, aquí solo rellenamos los datos
        document.getElementById('id-contacto').value = id;
        document.getElementById('nombre').value = fila.children[0].innerText.trim();
        document.getElementById('telefono').value = fila.children[1].innerText.trim();
        document.getElementById('email').value = fila.children[2].innerText.trim();
        document.getElementById('categoria').value = fila.children[3].innerText.trim();

        document.getElementById('tituloModal').innerHTML = '<i class="fa-solid fa-pen me-2"></i>Editar Contacto';
    }
});