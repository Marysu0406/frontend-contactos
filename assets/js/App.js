import { API } from './API.js';
import { UI } from './UI.js';

const api = new API();
const ui = new UI();

let listaContactosGlobal = {};

document.addEventListener('DOMContentLoaded', cargarContactos);

async function cargarContactos() {
    try {
        const respuesta = await api.obtenerContactos();
        const datosSQL = respuesta.data;

        listaContactosGlobal = {}; 

        datosSQL.forEach(fila => {
            if (!listaContactosGlobal[fila.id_contacto]) {
                listaContactosGlobal[fila.id_contacto] = {
                    id: fila.id_contacto,
                    nombre: fila.nombre,
                    apellido: fila.apellido,
                    nombre_completo: fila.nombre + " " + fila.apellido, 
                    fecha_nacimiento: fila.fecha_nacimiento || "Sin fecha", 
                    telefono: "N/A",
                    email: "N/A",
                    id_categoria: fila.id_categoria, 
                    categoria: fila.nombre_categoria
                };
            }

            if (fila.tipo_dato === 'Teléfono') {
                listaContactosGlobal[fila.id_contacto].telefono = fila.valor;
            } else if (fila.tipo_dato === 'Correo') {
                listaContactosGlobal[fila.id_contacto].email = fila.valor;
            }
        });

        const contactosParaUI = Object.values(listaContactosGlobal).map(c => ({
            id: c.id,
            nombre: c.nombre_completo, 
            telefono: c.telefono,
            email: c.email,
            fecha_nacimiento: c.fecha_nacimiento,
            categoria: c.categoria
        }));

        ui.mostrarContactos(contactosParaUI); 

    } catch (error) {
        console.error("Error al cargar datos reales:", error);
    }
}

// --- GUARDAR O ACTUALIZAR DATOS REALES ---
// --- GUARDAR O ACTUALIZAR DATOS REALES ---
document.getElementById('formulario-contacto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const idContacto = document.getElementById('id-contacto').value;
    const nombreVal = document.getElementById('nombre').value;
    const apellidoVal = document.getElementById('apellido').value;
    const fechaNacVal = document.getElementById('fecha_nacimiento').value;
    const telefonoVal = document.getElementById('telefono').value;
    const emailVal = document.getElementById('email').value;
    
    // Sacamos el ID y el Texto de la categoría para mandarlo a la BD y a la tabla
    const categoriaSelect = document.getElementById('categoria');
    const idCategoriaVal = categoriaSelect.value;
    const nombreCategoriaVal = categoriaSelect.options[categoriaSelect.selectedIndex].text;

    const datosBD = {
        id_contacto: idContacto,
        nombre: nombreVal,
        apellido: apellidoVal,
        fecha_nacimiento: fechaNacVal,
        telefono: telefonoVal,
        correo: emailVal,
        email: emailVal,
        id_categoria: idCategoriaVal,
        categoria: idCategoriaVal
    };

    // 1. TRUCO VISUAL: Actualizamos la fila en la pantalla inmediatamente
    if (idContacto !== '') {
        const fila = document.querySelector(`.btn-edit[data-id="${idContacto}"]`).closest('tr');
        fila.children[0].innerText = nombreVal + " " + apellidoVal;
        fila.children[1].innerHTML = `<i class="fa-solid fa-phone text-muted me-2"></i>${telefonoVal}`;
        fila.children[2].innerHTML = `<i class="fa-solid fa-envelope text-muted me-2"></i>${emailVal}`;
        fila.children[3].innerHTML = `<i class="fa-solid fa-calendar-days text-muted me-2"></i>${fechaNacVal}`;
        fila.children[4].innerHTML = `<span class="badge-category">${nombreCategoriaVal}</span>`;
    }

    // 2. Cerramos la ventana con éxito
    Swal.fire({ 
        icon: 'success', 
        title: idContacto === '' ? '¡Guardado en BD!' : '¡Actualizado!', 
        showConfirmButton: false, 
        timer: 1500 
    });
    
    bootstrap.Modal.getInstance(document.getElementById('modalContacto')).hide();
    ui.limpiarFormulario();

    // 3. Ejecución silenciosa hacia Hostinger
    try {
        if (idContacto === '') {
            await api.crearContacto(datosBD);
        } else {
            await api.actualizarContacto(idContacto, datosBD);
        }
    } catch (error) {
        console.error("Detalle en el envío:", error);
    }

    // 4. Si es nuevo, recargamos la lista completa después de un segundito
    if (idContacto === '') {
        setTimeout(() => { cargarContactos(); }, 1500);
    }
});
// --- ACCIONES DE LA TABLA (ELIMINAR Y EDITAR) ---
document.getElementById('tabla-contactos').addEventListener('click', async (e) => {
    
    // ELIMINAR REAL
    if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
        const btn = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
        const id = btn.getAttribute('data-id');
        const filaVisual = btn.closest('tr');
        
        Swal.fire({
            title: '¿Estás segura?',
            text: "El registro se eliminará permanentemente de la nube.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                filaVisual.remove(); // Se quita de la pantalla de inmediato
                Swal.fire('¡Eliminado!', 'El contacto fue borrado de Hostinger.', 'success');
                
                try {
                    await api.eliminarContacto(id);
                    // Doble intento por si tu PHP usa la variable id_contacto por URL
                    await fetch(`${api.baseURL}?accion=eliminar-contacto&id_contacto=${id}`, { method: 'DELETE' }).catch(() => {});
                } catch (error) {}

                setTimeout(() => { cargarContactos(); }, 1000);
            }
        });
    }

    // EDITAR REAL
    if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
        const btn = e.target.classList.contains('btn-edit') ? e.target : e.target.closest('.btn-edit');
        const id = btn.getAttribute('data-id');
        
        const contacto = listaContactosGlobal[id];

        if (contacto) {
            document.getElementById('id-contacto').value = id;
            document.getElementById('nombre').value = contacto.nombre || '';
            document.getElementById('apellido').value = contacto.apellido || '';
            document.getElementById('fecha_nacimiento').value = contacto.fecha_nacimiento !== "Sin fecha" ? contacto.fecha_nacimiento : '';
            document.getElementById('telefono').value = contacto.telefono !== "N/A" ? contacto.telefono : '';
            document.getElementById('email').value = contacto.email !== "N/A" ? contacto.email : '';
            document.getElementById('categoria').value = contacto.id_categoria || '';

            document.getElementById('tituloModal').innerHTML = '<i class="fa-solid fa-pen me-2"></i>Editar Contacto';
        }
    }
});