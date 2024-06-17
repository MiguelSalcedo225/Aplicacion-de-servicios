document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username && password) {
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Parseamos la respuesta JSON
            } else {
                throw new Error('Invalid credentials');
            }
        })
        .then(data => {
            if (data.role === 'Admin') {
                showAdminDashboard(); // Mostrar todas las funcionalidades para admin
            } else {
                showClientDashboard(); // Mostrar solo registrar servicio para usuarios normales
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Invalid credentials');
        });
    } else {
        alert('Por favor, ingrese el nombre de usuario y la contraseña.');
    }
});

function showAdminDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    hideAllSections();
}

function showClientDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    hideAllSections();
    
    // Ocultar botones que no son necesarios para usuarios normales
    document.querySelector('button[onclick="showSection(\'clientSection\')"]').style.display = 'none';
    document.querySelector('button[onclick="showSection(\'mensajeroSection\')"]').style.display = 'none';
    document.querySelector('button[onclick="showSection(\'userSection\')"]').style.display = 'none';
    document.querySelector('button[onclick="showSection(\'modifySection\')"]').style.display = 'none';
    document.querySelector('button[onclick="showSection(\'searchSection\')"]').style.display = 'none';
}

function hideAllSections() {
    var sections = document.querySelectorAll('.section');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
}

function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).style.display = 'block';
}

function sendData(url, data) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {alert(data); clearClientForm();})
    .catch(error => console.error('Error:', error));
}

function addClient() {
    var client = {
        id: document.getElementById('client_id').value,
        name: document.getElementById('client_name').value,
        address: document.getElementById('client_address').value,
        city: document.getElementById('client_city').value,
        email: document.getElementById('client_email').value,
        phone: document.getElementById('client_phone').value
    };
    sendData('/addClient', client);
}

function clearClientForm() {
    document.getElementById('client_id').value = '';
    document.getElementById('client_name').value = '';
    document.getElementById('client_address').value = '';
    document.getElementById('client_city').value = '';
    document.getElementById('client_email').value = '';
    document.getElementById('client_phone').value = '';
}

function searchClient() {
    var id = document.getElementById('search_client_id').value;
    fetch(`/getClient/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Cliente no encontrado');
            }
            return response.json();
        })
        .then(data => {
            populateClientTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
            clearClientTable();
        });
}

function populateClientTable(client) {
    var tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = ''; // Limpiar tabla antes de agregar datos

    var row = document.createElement('tr');
    row.innerHTML = `
        <td>${client.identificacion}</td>
        <td>${client.nombre}</td>
        <td>${client.direccion}</td>
        <td>${client.ciudad}</td>
        <td>${client.email}</td>
        <td>${client.telefonodecontacto}</td>
    `;
    tableBody.appendChild(row);

    // Mostrar la tabla de detalles del cliente
    document.getElementById('clientDetails').style.display = 'block';
    // Llenar campos de edición con los datos del cliente
    document.getElementById('edit_client_name').value = client.nombre;
    document.getElementById('edit_client_address').value = client.direccion;
    document.getElementById('edit_client_city').value = client.ciudad;
    document.getElementById('edit_client_email').value = client.email;
    document.getElementById('edit_client_phone').value = client.telefonodecontacto;
}

function clearClientTable() {
    var tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = '';

    // Ocultar la tabla de detalles del cliente si no hay resultados
    document.getElementById('clientDetails').style.display = 'none';
}

function deleteClient() {
    var clientId = document.getElementById('clientTableBody').rows[0].cells[0].textContent;
    fetch(`/deleteClient/${clientId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Cliente eliminado');
            document.getElementById('clientDetails').style.display = 'none';
        } else {
            alert('Error al eliminar el cliente');
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateClientForm() {
    // Mostrar sección de edición de cliente
    document.getElementById('clientEditSection').style.display = 'block';
}

function updateClient() {
    var clientId = document.getElementById('search_client_id').value;
    var client = {
        name: document.getElementById('edit_client_name').value,
        address: document.getElementById('edit_client_address').value,
        city: document.getElementById('edit_client_city').value,
        email: document.getElementById('edit_client_email').value,
        phone: document.getElementById('edit_client_phone').value
    };

    fetch(`/updateClient/${clientId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
    })
    .then(response => {
        if (response.ok) {
            alert('Cliente actualizado correctamente');
            // Actualizar la tabla de detalles del cliente
            searchClient();
            // Ocultar sección de edición de cliente
            document.getElementById('clientEditSection').style.display = 'none';
        } else {
            throw new Error('Error al actualizar el cliente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar el cliente');
    });
}

function cancelUpdate() {
    document.getElementById('clientEditSection').style.display = 'none';
}



function addCourier() {
    var courier = {
        id: document.getElementById('courier_id').value,
        name: document.getElementById('courier_name').value,
        address: document.getElementById('courier_address').value,
        email: document.getElementById('courier_email').value,
        phone: document.getElementById('courier_phone').value,
        transport: document.getElementById('courier_transport').value
    };
    sendData('/addCourier', courier);
}

function assignmessenger() {
    var courier = {
        idService: document.getElementById('service_code').value,
        idClient: document.getElementById('Id_Cliente').value,
        idMessenger: document.getElementById('Id_Mensajero').value,
    };
    sendData('/assignmessenger', courier);
    sendData('/assignmessengerClient',courier);
}


function addService() {
    var service = {
        code: document.getElementById('service_code_r').value,
        date: document.getElementById('service_date').value,
        time: document.getElementById('service_time').value,
        origin: document.getElementById('service_origin').value,
        destination: document.getElementById('service_destination').value,
        description: document.getElementById('service_description').value,
        transport: document.getElementById('service_transport').value,
        packages: document.getElementById('service_packages').value,
        IdClient: document.getElementById('Id_Client').value
    };
    sendData('/addService', service);
}

function addUser() {
    var user = {
        login: document.getElementById('user_login').value,
        password: document.getElementById('user_password').value,
        address: document.getElementById('user_address').value,
        email: document.getElementById('user_email').value,
        phone: document.getElementById('user_phone').value,
        role: document.getElementById('user_rol').value
    };
    sendData('/addUser', user);
}

function modifyService() {
    var service = {
        codeS: document.getElementById('codeS').value,
        codeM: document.getElementById('codeM').value,
        status: document.getElementById('modify_service_status').value,
    };
    sendData('/modifyService', service);
}

function monitorService() {
    const serviceCode = document.getElementById('service_code_monitor').value;
    fetch(`/monitorService/${serviceCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Servicio no encontrado`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('service_status_monitor').innerText = data.estado;
            document.getElementById('service_datetime_monitor').innerText = Date(data.fechayhoradelestado);
            document.getElementById('service_description_monitor').innerText = data.descripcion;
            document.getElementById('serviceResult').style.display = 'block';
        })
        .catch(error => {
            alert(error.message);
        });
}

function generateClientReport() {
    var clienteId = document.getElementById('report_cliente_id').value;
    var mes = document.getElementById('report_mes').value;
    var ano = document.getElementById('report_ano').value;

    window.open(`/reportes/servicios-por-cliente?clienteId=${clienteId}&mes=${mes}&ano=${ano}`, '_blank');
}

function generateMensajeroReport() {
    var mensajeroId = document.getElementById('report_mensajero_id').value;
    var mes = document.getElementById('report_mes_mensajero').value;
    var ano = document.getElementById('report_ano_mensajero').value;

    window.open(`/reportes/servicios-por-mensajero?mensajeroId=${mensajeroId}&mes=${mes}&ano=${ano}`, '_blank');
}



