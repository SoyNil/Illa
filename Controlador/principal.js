let chartInstance = null;
let currentPatients = [];
let isAdmin = false;

async function loadUserInfo() {
    try {
        const response = await fetch('../Controlador/get_user.php');
        const user = await response.json();
        if (user.success) {
            const data = user.data;
            document.getElementById('nombre').textContent = data.Nombre;
            document.getElementById('usuario').textContent = data.Usuario;
            document.getElementById('correo').textContent = data.Correo;
            const ocupacion = parseInt(data.Ocupacion);
            isAdmin = ocupacion === 1;
            const rol = ocupacion === 1 ? 'Administrador' : 'Psicólogo';
            document.getElementById('welcomeMessage').textContent = `Bienvenido, ${data.Usuario} | Ocupación: ${rol}`;
            
            if (ocupacion === 1) {
                document.getElementById('registerButton').style.display = 'block';
                document.getElementById('viewUsersButton').style.display = 'block';
                document.getElementById('addPatientButton').style.display = 'block';
            } else if (ocupacion === 2) {
                document.getElementById('viewProfileButton').style.display = 'block';
            }
            loadPatients(ocupacion, data.ID);
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

async function loadPatients(ocupacion, userId) {
    try {
        const response = await fetch(`../Controlador/get_patients.php?ocupacion=${ocupacion}&userId=${userId}`);
        if (!response.ok) throw new Error('Error al cargar pacientes: ' + response.status);
        const patients = await response.json();
        currentPatients = patients;
        renderPatientList(patients);
        renderChart(patients, document.getElementById('chartType').value);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        alert('Error al cargar pacientes: ' + error.message);
        renderPatientList([]);
        renderChart([]);
    }
}

function renderPatientList(patients) {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '';

    if (patients.length === 0) {
        patientList.innerHTML = '<p class="text-light">No hay pacientes disponibles.</p>';
        return;
    }

    patients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'mb-3 p-2 border-bottom';
        patientDiv.innerHTML = `
            <p class="text-light mb-1"><strong>${patient.Nombre}</strong> (DNI: ${patient.DNI})</p>
            <p class="text-light mb-1">Fecha de Cita: ${patient.Fecha}</p>
            <p class="text-light mb-1">Fecha de Registro: ${patient.fecha_actual}</p>
            <p class="text-light mb-1">Precio: S/ ${parseFloat(patient.Precio).toFixed(2)}</p>
            <p class="text-light mb-1">Descuento: ${parseFloat(patient.Descuento).toFixed(2)}%</p>
            <p class="text-light mb-1">Ganancia: S/ ${parseFloat(patient.Precio_Descuento).toFixed(2)}</p>
            <p class="text-light mb-1">Psicólogo: ${patient.Psicologo}</p>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="atendido_${patient.ID}" ${patient.Atendido == 1 ? 'checked' : ''} onchange="updatePatient(${patient.ID}, 'Atendido', this.checked)">
                <label class="form-check-label text-light" for="atendido_${patient.ID}">¿Atendió al paciente?</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="historial_${patient.ID}" ${patient.Historial_Clinico == 1 ? 'checked' : ''} onchange="updatePatient(${patient.ID}, 'Historial_Clinico', this.checked)">
                <label class="form-check-label text-light" for="historial_${patient.ID}">Historial Clínico</label>
            </div>
            <div class="mt-2">
                <button class="btn btn-warning btn-sm me-2" onclick='openEditModal(${JSON.stringify(patient)})'>Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.ID})">Eliminar</button>
            </div>
        `;
        patientList.appendChild(patientDiv);
    });
}

async function updatePatient(patientId, field, value) {
    try {
        const response = await fetch('../Controlador/update_patient.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: patientId, field, value: value ? 1 : 0 })
        });

        const text = await response.text();
        console.log('Respuesta del servidor:', text);
        const result = JSON.parse(text);

        if (result.success) {
            const ocupacion = isAdmin ? 1 : 2;
            const userId = (await (await fetch('../Controlador/get_user.php')).json()).data.ID;
            loadPatients(ocupacion, userId);
        } else {
            alert('Error al actualizar: ' + result.message);
        }
    } catch (error) {
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

async function openEditModal(patient) {
    document.getElementById('editPatientId').value = patient.ID;
    document.getElementById('editDNI').value = patient.DNI;
    document.getElementById('editNombre').value = patient.Nombre;
    document.getElementById('editFecha').value = patient.Fecha;
    document.getElementById('editPrecio').value = parseFloat(patient.Precio).toFixed(2);

    if (isAdmin) {
        document.getElementById('descuentoGroup').style.display = 'block';
        document.getElementById('psychologistGroup').style.display = 'block';
        document.getElementById('editDescuento').value = parseFloat(patient.Descuento).toFixed(2);

        try {
            const response = await fetch('../Controlador/get_psychologists.php');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }
            const psychologists = await response.json();
            const select = document.getElementById('editPsychologist');
            select.innerHTML = '<option value="">Seleccione un psicólogo</option>';

            if (psychologists.success === false) {
                throw new Error(psychologists.message);
            }

            if (Array.isArray(psychologists) && psychologists.length > 0) {
                psychologists.forEach(psy => {
                    const option = document.createElement('option');
                    option.value = psy.ID;
                    option.textContent = psy.Nombre;
                    if (psy.ID == patient.Usuario_ID) option.selected = true;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">No hay psicólogos disponibles</option>';
            }
        } catch (error) {
            console.error('Error al cargar psicólogos:', error);
            document.getElementById('editPsychologist').innerHTML = '<option value="">Error al cargar psicólogos: ' + error.message + '</option>';
            alert('No se pudieron cargar los psicólogos: ' + error.message);
        }
    } else {
        document.getElementById('descuentoGroup').style.display = 'none';
        document.getElementById('psychologistGroup').style.display = 'none';
    }

    const modal = new bootstrap.Modal(document.getElementById('editPatientModal'));
    modal.show();

    const modalElement = document.getElementById('editPatientModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        const editButton = document.querySelector(`button[onclick*='openEditModal(${JSON.stringify(patient)}']`);
        if (editButton) {
            editButton.focus();
        }
    }, { once: true });
}

async function savePatientChanges() {
    const id = document.getElementById('editPatientId').value;
    const dni = document.getElementById('editDNI').value;
    const nombre = document.getElementById('editNombre').value;
    const fecha = document.getElementById('editFecha').value;
    const precio = parseFloat(document.getElementById('editPrecio').value);
    const descuento = isAdmin ? parseFloat(document.getElementById('editDescuento').value) : null;
    const psicologoId = isAdmin ? document.getElementById('editPsychologist').value : null;

    if (!/^\d{8}$/.test(dni)) {
        alert('El DNI debe tener 8 dígitos numéricos.');
        return;
    }
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío.');
        return;
    }
    if (!fecha) {
        alert('La fecha de cita es requerida.');
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser un número positivo.');
        return;
    }
    if (isAdmin && (isNaN(descuento) || descuento < 0 || descuento > 100)) {
        alert('El descuento debe estar entre 0 y 100.');
        return;
    }
    if (isAdmin && !psicologoId) {
        alert('Debe seleccionar un psicólogo.');
        return;
    }

    try {
        const response = await fetch('../Controlador/edit_patient.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                dni,
                Nombre: nombre,
                Fecha: fecha,
                Precio: precio,
                Descuento: descuento,
                Usuario_ID: psicologoId
            })
        });

        const text = await response.text();
        console.log('Respuesta del servidor:', text);
        try {
            const result = JSON.parse(text);
            if (result.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editPatientModal'));
                modal.hide();
                const ocupacion = isAdmin ? 1 : 2;
                const userId = (await (await fetch('../Controlador/get_user.php')).json()).data.ID;
                loadPatients(ocupacion, userId);
            } else {
                alert('Error al guardar cambios: ' + result.message);
            }
        } catch (e) {
            console.error('Respuesta del servidor no es JSON válido:', text);
            alert('Error inesperado del servidor:\n' + text);
        }
    } catch (error) {
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

async function deletePatient(patientId) {
    if (!confirm('¿Estás seguro de que deseas eliminar a este paciente?')) {
        return;
    }

    try {
        const response = await fetch('../Controlador/delete_patient.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: patientId })
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
            const ocupacion = isAdmin ? 1 : 2;
            const userId = (await (await fetch('../Controlador/get_user.php')).json()).data.ID;
            loadPatients(ocupacion, userId);
        } else {
            alert('Error al eliminar: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        let errorMessage = error.message;
        try {
            const errorResponse = await response.json();
            if (errorResponse.message) {
                errorMessage = errorResponse.message;
            }
        } catch (e) {
            // Si no se puede parsear, mantener el mensaje original
        }
        alert('Error al conectar con el servidor: ' + errorMessage);
    }
}

async function openAddPatientModal() {
    document.getElementById('addDNI').value = '';
    document.getElementById('addNombre').value = '';
    document.getElementById('addFecha').value = '';
    document.getElementById('addPrecio').value = '';
    document.getElementById('addDescuento').value = '0';

    try {
        const response = await fetch('../Controlador/get_psychologists.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const psychologists = await response.json();
        const select = document.getElementById('addPsychologist');
        select.innerHTML = '<option value="">Seleccione un psicólogo</option>';

        if (psychologists.success === false) {
            throw new Error(psychologists.message);
        }

        if (Array.isArray(psychologists) && psychologists.length > 0) {
            psychologists.forEach(psy => {
                const option = document.createElement('option');
                option.value = psy.ID;
                option.textContent = psy.Nombre;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No hay psicólogos disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar psicólogos:', error);
        document.getElementById('addPsychologist').innerHTML = '<option value="">Error al cargar psicólogos: ' + error.message + '</option>';
        alert('No se pudieron cargar los psicólogos: ' + error.message);
    }

    const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
    modal.show();

    const modalElement = document.getElementById('addPatientModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        const addButton = document.getElementById('addPatientButton');
        if (addButton) {
            addButton.focus();
        }
    }, { once: true });
}

async function addPatient() {
    const dni = document.getElementById('addDNI').value;
    const nombre = document.getElementById('addNombre').value;
    const fecha = document.getElementById('addFecha').value;
    const precio = parseFloat(document.getElementById('addPrecio').value);
    const descuento = parseFloat(document.getElementById('addDescuento').value);
    const psicologoId = document.getElementById('addPsychologist').value;

    if (!/^\d{8}$/.test(dni)) {
        alert('El DNI debe tener 8 dígitos numéricos.');
        return;
    }
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío.');
        return;
    }
    if (!fecha) {
        alert('La fecha de cita es requerida.');
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser un número positivo.');
        return;
    }
    if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        alert('El descuento debe estar entre 0 y 100.');
        return;
    }
    if (!psicologoId) {
        alert('Debe seleccionar un psicólogo.');
        return;
    }

    try {
        const response = await fetch('../Controlador/add_patient.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dni,
                Nombre: nombre,
                Fecha: fecha,
                Precio: precio,
                Descuento: descuento,
                Usuario_ID: psicologoId
            })
        });

        const rawText = await response.text();
        let result;

        try {
            result = JSON.parse(rawText);
        } catch (jsonError) {
            throw new Error(`Respuesta del servidor no es JSON válido:\n\n${rawText}`);
        }

        if (!response.ok) {
            throw new Error('Error del servidor: ' + result.message);
        }

        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPatientModal'));
            modal.hide();
            const ocupacion = isAdmin ? 1 : 2;
            const userId = (await (await fetch('../Controlador/get_user.php')).json()).data.ID;
            loadPatients(ocupacion, userId);
        } else {
            alert('Error al agregar paciente: ' + result.message);
        }
    } catch (error) {
        console.error('Error detallado:', error);
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

function searchPatients() {
    const searchTerm = document.getElementById('searchPatients').value.toLowerCase();
    const filteredPatients = currentPatients.filter(patient => 
        patient.Nombre.toLowerCase().includes(searchTerm) || 
        patient.DNI.includes(searchTerm)
    );
    renderPatientList(filteredPatients);
    renderChart(filteredPatients, document.getElementById('chartType').value);
}

function renderChart(patients, chartType) {
    const ctx = document.getElementById('patientChart').getContext('2d');
    
    const totalGanancia = patients
        .filter(p => p.Atendido == 1)
        .reduce((sum, p) => sum + parseFloat(p.Precio_Descuento), 0);
    
    const chartTypeMap = {
        'pie': 'pie',
        'line': 'line',
        'bar': 'bar',
        'column': 'bar'
    };

    const isBarOrColumn = chartType === 'bar' || chartType === 'column';
    const isColumn = chartType === 'column';
    
    const data = {
        labels: patients.map(p => p.Nombre),
        datasets: [{
            label: 'Ganancia (S/)',
            data: patients.map(p => parseFloat(p.Precio_Descuento)),
            backgroundColor: isBarOrColumn ? patients.map(p => {
                const atendido = p.Atendido == 1;
                const historial = p.Historial_Clinico == 1;
                if (atendido && historial) return '#28a745';
                if (atendido || historial) return '#fd7e14';
                return '#dc3545';
            }) : undefined,
            borderColor: isBarOrColumn ? '#343a40' : patients.map(p => {
                const atendido = p.Atendido == 1;
                const historial = p.Historial_Clinico == 1;
                if (atendido && historial) return '#28a745';
                if (atendido || historial) return '#fd7e14';
                return '#dc3545';
            }),
            pointBackgroundColor: chartType === 'line' ? patients.map(p => {
                const atendido = p.Atendido == 1;
                const historial = p.Historial_Clinico == 1;
                if (atendido && historial) return '#28a745';
                if (atendido || historial) return '#fd7e14';
                return '#dc3545';
            }) : undefined,
            fill: chartType === 'line' ? false : undefined,
            borderWidth: 1
        }]
    };

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: chartTypeMap[chartType] || 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: isColumn ? 'y' : 'x',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8f9fa' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || context.parsed;
                            return `${context.label}: S/ ${value.toFixed(2)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Total: S/ ${totalGanancia.toFixed(2)}`,
                    color: '#f8f9fa',
                    font: { size: 16 },
                    padding: { bottom: 20 }
                }
            },
            scales: isBarOrColumn ? {
                x: { beginAtZero: true, ticks: { color: '#f8f9fa' }, grid: { color: '#495057' } },
                y: { ticks: { color: '#f8f9fa' }, grid: { color: '#495057' } }
            } : undefined
        }
    });
}

document.getElementById('chartType').addEventListener('change', function() {
    renderChart(currentPatients, this.value);
});

document.getElementById('addPatientButton').addEventListener('click', openAddPatientModal);
document.getElementById('searchPatients').addEventListener('input', searchPatients);

loadUserInfo();