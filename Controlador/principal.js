let chartInstance = null;
let currentPatients = [];
let isAdmin = false;
let currentUser = null;

async function loadUserInfo() {
    try {
        const response = await fetch('../Controlador/get_user.php');
        const user = await response.json();
        console.log('Respuesta de get_user.php:', user);
        if (user.success) {
            const data = user.data;
            currentUser = data;
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
            loadNotices();
        } else { 
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
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

async function loadNotices() {
    try {
        const response = await fetch('../Controlador/get_notices.php');
        if (!response.ok) throw new Error('Error al cargar avisos: ' + response.status);
        const notices = await response.json();
        renderNoticeList(notices);
    } catch (error) {
        console.error('Error al cargar avisos:', error);
        alert('Error al cargar avisos: ' + error.message);
        renderNoticeList([]);
    }
}

function renderNoticeList(notices) {
    const noticeList = document.getElementById('noticeList');
    noticeList.innerHTML = '';

    if (notices.length === 0) {
        noticeList.innerHTML = '<p class="text-light">No hay avisos disponibles.</p>';
        return;
    }

    notices.forEach(notice => {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'mb-3 p-2 border-bottom';
        noticeDiv.innerHTML = `
            <p class="text-light mb-1"><strong>${notice.usuario_nombre}</strong></p>
            <p class="text-light mb-1">${notice.aviso}</p>
            <p class="text-light mb-1"><small>${new Date(notice.fecha).toLocaleString()}</small></p>
            ${isAdmin ? `<button class="btn btn-danger btn-sm" onclick="deleteNotice(${notice.id})">Eliminar</button>` : ''}
        `;
        noticeList.appendChild(noticeDiv);
    });
}

async function openAddNoticeModal() {
    if (!currentUser || !currentUser.ID || !currentUser.Nombre) {
        alert('Error: No se pudo cargar la información del usuario. Intente iniciar sesión nuevamente.');
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('addNoticeText').value = '';
    document.getElementById('addNoticeUserId').value = currentUser.ID;
    document.getElementById('addNoticeUserName').value = currentUser.Nombre;

    const modal = new bootstrap.Modal(document.getElementById('addNoticeModal'), {
        backdrop: 'static'
    });
    modal.show();

    const modalElement = document.getElementById('addNoticeModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        const addButton = document.getElementById('addNoticeButton');
        if (addButton) {
            addButton.focus();
        }
    }, { once: true });
}

async function addNotice() {
    const usuario_id = document.getElementById('addNoticeUserId').value;
    const usuario_nombre = document.getElementById('addNoticeUserName').value;
    const aviso = document.getElementById('addNoticeText').value.trim();

    if (!usuario_id || !usuario_nombre || !aviso) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const payload = {
        Usuario_ID: usuario_id,
        usuario_nombre,
        aviso
    };
    console.log('Enviando datos a add_notice.php:', payload);

    try {
        const response = await fetch('../Controlador/add_notice.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Respuesta del servidor:', text);

        if (!response.ok) {
            throw new Error(`Error al agregar aviso: ${response.status} - ${text}`);
        }

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error(`Respuesta del servidor no es JSON válido: ${text}`);
        }

        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addNoticeModal'));
            modal.hide();
            loadNotices();
        } else {
            alert('Error al agregar aviso: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error en addNotice:', error);
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

async function deleteNotice(noticeId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este aviso?')) {
        return;
    }

    try {
        const response = await fetch('../Controlador/delete_notice.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: noticeId })
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
            loadNotices();
        } else {
            alert('Error al eliminar: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al eliminar aviso:', error);
        alert('Error al conectar con el servidor: ' + error.message);
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

            if (!Array.isArray(psychologists)) {
                throw new Error(psychologists.message || 'Respuesta no es un array');
            }

            if (psychologists.length > 0) {
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

    const modal = new bootstrap.Modal(document.getElementById('editPatientModal'), {
        backdrop: 'static'
    });
    modal.show();

    const modalElement = document.getElementById('editPatientModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        const editButton = document.querySelector(`button[onclick*='openEditModal(${JSON.stringify(patient)}']`);
        if (editButton) editButton.focus();
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
                const modalElement = document.getElementById('editPatientModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                modalElement.addEventListener('hidden.bs.modal', async function handleHidden() {
                    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('padding-right');
                    const ocupacion = isAdmin ? 1 : 2;
                    const userId = (await (await fetch('../Controlador/get_user.php')).json()).data.ID;
                    loadPatients(ocupacion, userId);
                    modalElement.removeEventListener('hidden.bs.modal', handleHidden);
                }, { once: true });
                modal.hide();
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

        if (!Array.isArray(psychologists)) {
            throw new Error(psychologists.message || 'Respuesta no es un array');
        }

        if (psychologists.length > 0) {
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

    const modal = new bootstrap.Modal(document.getElementById('addPatientModal'), {
        backdrop: 'static'
    });
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

function toggleCustomDateRange() {
    const dateRange = document.getElementById('dateRange').value;
    const customDateRange = document.getElementById('customDateRange');
    if (dateRange === 'custom') {
        customDateRange.classList.remove('d-none');
    } else {
        customDateRange.classList.add('d-none');
    }
}

function searchPatients() {
    const searchTerm = document.getElementById('searchPatients').value.toLowerCase();
    const searchType = document.getElementById('searchType').value;
    const dateFilterType = document.getElementById('dateFilterType').value;
    const dateRange = document.getElementById('dateRange').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    let filteredPatients = currentPatients;

    if (searchTerm && searchType) {
        filteredPatients = filteredPatients.filter(patient => {
            if (searchType === 'nombre') {
                return patient.Nombre.toLowerCase().includes(searchTerm);
            } else if (searchType === 'dni') {
                return patient.DNI.includes(searchTerm);
            } else if (searchType === 'psicologo') {
                return patient.Psicologo.toLowerCase().includes(searchTerm);
            }
            return false;
        });
    }

    if (dateFilterType && dateRange) {
        const now = new Date();
        let fromDate, toDate;

        if (dateRange === 'custom' && dateFrom && dateTo) {
            fromDate = new Date(dateFrom);
            toDate = new Date(dateTo);
            if (fromDate > toDate) {
                alert('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
                return;
            }
            toDate.setHours(23, 59, 59, 999);
        } else if (dateRange !== 'custom') {
            toDate = new Date(now);
            toDate.setHours(23, 59, 59, 999);
            fromDate = new Date(now);
            const days = parseInt(dateRange);
            fromDate.setDate(now.getDate() - days);
            fromDate.setHours(0, 0, 0, 0);
        } else {
            renderPatientList(filteredPatients);
            renderChart(filteredPatients, document.getElementById('chartType').value);
            return;
        }

        filteredPatients = filteredPatients.filter(patient => {
            const patientDate = new Date(patient[dateFilterType]);
            return patientDate >= fromDate && patientDate <= toDate;
        });
    }

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

async function openViewUsersModal() {
    try {
        const response = await fetch('../Controlador/get_psychologists.php');
        if (!response.ok) throw new Error('Error al cargar psicólogos: ' + response.status);
        const psychologists = await response.json();
        console.log('Respuesta de get_psychologists.php:', psychologists);
        if (!Array.isArray(psychologists)) {
            throw new Error(psychologists.message || 'Respuesta no es un array');
        }
        renderPsychologistList(psychologists);
        const modalElement = document.getElementById('viewUsersModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static'
        });
        modal.show();
        modalElement.addEventListener('hidden.bs.modal', function () {
            const viewButton = document.getElementById('viewUsersButton');
            if (viewButton) viewButton.focus();
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
        }, { once: true });
    } catch (error) {
        console.error('Error al cargar psicólogos:', error);
        alert('Error al cargar psicólogos: ' + error.message);
        renderPsychologistList([]);
    }
}

function renderPsychologistList(psychologists) {
    const psychologistList = document.getElementById('psychologistList');
    psychologistList.innerHTML = '';

    if (!Array.isArray(psychologists) || psychologists.length === 0) {
        psychologistList.innerHTML = '<p class="text-light">No hay psicólogos disponibles.</p>';
        return;
    }

    psychologists.forEach(psy => {
        const psyDiv = document.createElement('div');
        psyDiv.className = 'mb-3 p-2 border-bottom';
        psyDiv.innerHTML = `
            <p class="text-light mb-1"><strong>${psy.Nombre} ${psy.Apellido}</strong> (${psy.Usuario})</p>
            <p class="text-light mb-1">Correo: ${psy.Correo}</p>
            <p class="text-light mb-1">Ocupación: ${psy.Ocupacion == 1 ? 'Administrador' : 'Psicólogo'}</p>
            <p class="text-light mb-1">Fecha de Registro: ${new Date(psy.fecha_registro).toLocaleString()}</p>
            <button class="btn btn-warning btn-sm me-2" onclick='openEditUserModal(${JSON.stringify(psy)})'>Editar</button>
            <button class="btn btn-danger btn-sm ms-2" onclick='deleteUser(${psy.ID})'>Eliminar</button>
        `;
        psychologistList.appendChild(psyDiv);
    });
}

async function deleteUser(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const response = await fetch('../Controlador/eliminar_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) // <= aquí se envía el ID correctamente
        });

        const result = await response.json();
        if (result.success) {
            alert('Usuario eliminado correctamente.');
            loadUserList(); // o como se llame tu función para recargar la lista
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error en la solicitud: ' + error.message);
    }
}

async function openEditUserModal(user) {
    document.getElementById('editUserId').value = user.ID;
    document.getElementById('editUserNombre').value = user.Nombre;
    document.getElementById('editUserApellido').value = user.Apellido;
    document.getElementById('editUserUsuario').value = user.Usuario;
    document.getElementById('editUserCorreo').value = user.Correo;
    document.getElementById('editUserContrasena').value = '';
    document.getElementById('editUserOcupacion').value = user.Ocupacion;

    const modalElement = document.getElementById('editUserModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static'
    });
    modal.show();

    modalElement.addEventListener('hidden.bs.modal', function () {
        const editButton = document.querySelector(`button[onclick*='openEditUserModal(${JSON.stringify(user)}']`);
        if (editButton) editButton.focus();
        const parentModal = document.getElementById('viewUsersModal');
        if (parentModal.classList.contains('show')) {
            document.body.classList.add('modal-open');
            if (!document.querySelector('.modal-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        }
    }, { once: true });
}

async function saveUserChanges() {
    const id = document.getElementById('editUserId').value;
    const nombre = document.getElementById('editUserNombre').value.trim();
    const apellido = document.getElementById('editUserApellido').value.trim();
    const usuario = document.getElementById('editUserUsuario').value.trim();
    const correo = document.getElementById('editUserCorreo').value.trim();
    const contrasena = document.getElementById('editUserContrasena').value;
    const ocupacion = document.getElementById('editUserOcupacion').value;

    if (!nombre) {
        alert('El nombre no puede estar vacío.');
        return;
    }
    if (!apellido) {
        alert('El apellido no puede estar vacío.');
        return;
    }
    if (!usuario || usuario.length > 10) {
        alert('El usuario debe tener máximo 10 caracteres.');
        return;
    }
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        alert('El correo no es válido.');
        return;
    }
    if (contrasena && (contrasena.length < 6 || contrasena.length > 12)) {
        alert('La contraseña debe tener entre 6 y 12 caracteres.');
        return;
    }
    if (!ocupacion) {
        alert('Debe seleccionar una ocupación.');
        return;
    }

    const payload = {
        id,
        Nombre: nombre,
        Apellido: apellido,
        Usuario: usuario,
        Correo: correo,
        Ocupacion: ocupacion
    };
    if (contrasena) payload.Contrasena = contrasena;

    try {
        const response = await fetch('../Controlador/edit_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        const text = await response.text();
        console.log('Respuesta de edit_user.php:', text);
        const result = JSON.parse(text);

        if (result.success) {
            const modalElement = document.getElementById('editUserModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modalElement.addEventListener('hidden.bs.modal', function handleHidden() {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
                openViewUsersModal();
                modalElement.removeEventListener('hidden.bs.modal', handleHidden);
            }, { once: true });
            modal.hide();
        } else {
            alert('Error al guardar cambios: ' + result.message);
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

function openViewProfileModal() {
    if (!currentUser) {
        alert('Error: No se pudo cargar la información del usuario.');
        return;
    }
    document.getElementById('profileNombre').textContent = currentUser.Nombre;
    document.getElementById('profileApellido').textContent = currentUser.Apellido;
    document.getElementById('profileUsuario').textContent = currentUser.Usuario;
    document.getElementById('profileCorreo').textContent = currentUser.Correo;
    document.getElementById('profileOcupacion').textContent = currentUser.Ocupacion == 1 ? 'Administrador' : 'Psicólogo';
    document.getElementById('profileFechaRegistro').textContent = new Date(currentUser.fecha_registro).toLocaleString();

    const modal = new bootstrap.Modal(document.getElementById('viewProfileModal'), {
        backdrop: 'static'
    });
    modal.show();

    const modalElement = document.getElementById('viewProfileModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        const viewButton = document.getElementById('viewProfileButton');
        if (viewButton) viewButton.focus();
    }, { once: true });
}

document.getElementById('chartType').addEventListener('change', function() {
    renderChart(currentPatients, this.value);
});

document.getElementById('addPatientButton').addEventListener('click', openAddPatientModal);
document.getElementById('searchPatients').addEventListener('input', searchPatients);
document.getElementById('searchType').addEventListener('change', searchPatients);
document.getElementById('dateFilterType').addEventListener('change', searchPatients);
document.getElementById('dateRange').addEventListener('change', function() {
    toggleCustomDateRange();
    searchPatients();
});
document.getElementById('dateFrom').addEventListener('change', searchPatients);
document.getElementById('dateTo').addEventListener('change', searchPatients);

loadUserInfo();