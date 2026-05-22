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
                    categoria: fila.nombre_categoria || fila.id_categoria
                };
            }

            if (fila.tipo_dato === 'Teléfono') {
                listaContactosGlobal[fila.id_contacto].telefono = fila.valor;
            } else if (fila.tipo_dato === 'Correo') {
                listaContactosGlobal[fila.id_contacto].email = fila.valor;
            }
        });

        const contactosParaUI = Object.values(listaContactosGlobal);
        ui.mostrarContactos(contactosParaUI); 

    } catch (error) {
        console.error("Error al cargar:", error);
    }
}

document.getElementById('formulario-contacto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const idContacto = document.getElementById('id-contacto').value;
    const categoriaSelect = document.getElementById('categoria');
    
    // Si la fecha está vacía, mandamos una por defecto para que la BD no marque error
    const datosBD = {
        id_contacto: idContacto,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value || '2000-01-01', 
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('email').value,
        id_categoria: categoriaSelect.value
    };

    try {
        if (idContacto === '') {
            await api.crearContacto(datosBD);
        } else {
            await api.actualizarContacto(idContacto, datosBD);
        }
        
        Swal.fire({ icon: 'success', title: '¡Guardado en BD!', showConfirmButton: false, timer: 1500 });
        bootstrap.Modal.getInstance(document.getElementById('modalContacto')).hide();
        ui.limpiarFormulario();
        
        setTimeout(() => { cargarContactos(); }, 1000); 
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error al guardar' });
    }
});

document.getElementById('tabla-contactos').addEventListener('click', async (e) => {
    if (e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').getAttribute('data-id');
        
        Swal.fire({
            title: '¿Estás segura?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.eliminarContacto(id);
                Swal.fire('¡Eliminado!', '', 'success');
                cargarContactos();
            }
        });
    }

    if (e.target.closest('.btn-edit')) {
        const id = e.target.closest('.btn-edit').getAttribute('data-id');
        const contacto = listaContactosGlobal[id];

        if (contacto) {
            document.getElementById('id-contacto').value = id;
            document.getElementById('nombre').value = contacto.nombre;
            document.getElementById('apellido').value = contacto.apellido;
            document.getElementById('fecha_nacimiento').value = contacto.fecha_nacimiento !== "Sin fecha" ? contacto.fecha_nacimiento : '';
            document.getElementById('telefono').value = contacto.telefono !== "N/A" ? contacto.telefono : '';
            document.getElementById('email').value = contacto.email !== "N/A" ? contacto.email : '';
            document.getElementById('categoria').value = contacto.id_categoria;

            document.getElementById('tituloModal').innerHTML = '<i class="fa-solid fa-pen me-2"></i>Editar Contacto';
        }
    }
});