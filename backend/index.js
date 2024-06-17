const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const Pool = require('pg-pool');
const PDFDocument = require('pdfkit');

// Configuración de la base de datos
const config = {
    user: "postgres",
    database: "postgres",
    password: "1234",
    host: "172.25.98.220",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};

const pool = new Pool(config);

pool.on('error', (err, client) => {
    console.error('idle client error', err.message, err.stack);
});

function connect(callback) {
    return pool.connect(callback);
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM usuario WHERE login = $1 AND contrasena = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.status(200).json({ message: 'Login successful', role: user.rol });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal server error');
    }
});

// Rutas para registrar cliente, mensajero, servicio y usuario
app.post('/addClient', (req, res) => {
    const { id, name, address, city, email, phone } = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('INSERT INTO cliente (identificacion, nombre, direccion, ciudad, email, telefonoDeContacto) VALUES ($1, $2, $3, $4, $5, $6)', 
                     [id, name, address, city, email, phone], 
                     (err) => {
                         done();
                         if (err) return res.status(500).send(err.message);
                         res.status(200).send('Cliente añadido');
                     });
    });
});

// Buscar cliente por ID
app.get('/getClient/:id', (req, res) => {
    const id = req.params.id;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('SELECT * FROM cliente WHERE identificacion = $1', [id], (err, result) => {
            done();
            if (err) return res.status(500).send(err.message);
            if (result.rows.length === 0) {
                return res.status(404).send('Cliente no encontrado');
            }
            res.status(200).json(result.rows[0]);
        });
    });
});

app.put('/updateClient/:id', (req, res) => {
    const clientId = req.params.id;
    const { name, address, city, email, phone } = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('UPDATE cliente SET nombre = $1, direccion = $2, ciudad = $3, email = $4, telefonoDeContacto = $5 WHERE identificacion = $6', 
                     [name, address, city, email, phone, clientId], 
                     (err) => {
                         done();
                         if (err) return res.status(500).send(err.message);
                         res.status(200).send('Cliente actualizado');
                     });
    });
});

app.delete('/deleteClient/:id', (req, res) => {
    const { id } = req.params;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('DELETE FROM cliente WHERE identificacion = $1', [id], (err) => {
            done();
            if (err) return res.status(500).send(err.message);
            res.status(200).send('Cliente eliminado');
        });
    });
});


app.post('/addCourier', (req, res) => {
    const { id, name, address, email, phone, transport } = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('INSERT INTO mensajero (identificacion, nombre, direccion, email, telefonoDeContacto, medioDeTransporte) VALUES ($1, $2, $3, $4, $5, $6)', 
                     [id, name, address, email, phone, transport], 
                     (err) => {
                         done();
                         if (err) return res.status(500).send(err.message);
                         res.status(200).send('Courier added');
                     });
    });
});


//Actualizar servicio con el mensajero
app.post('/assignmessenger', (req, res) => {
    const {idService, idMessenger} = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);

        const query = `
            UPDATE servicio 
            SET mIdentificacion = $2
            WHERE codigo = $1
        `;
        const values = [idService,idMessenger];

        client.query(query, values, (err) => {
            done();
            if (err) {
                return res.status(500).send(err.message);
            }
            res.status(200).send('Mensajero Asignado');
        });
    });
});

//Insertar la un mensajero relacionado con un cliente
app.post('/assignmessengerClient', (req, res) => {
    const { idMessenger,idClient} = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('INSERT INTO mensajero_cliente (mIdentificacion, cIdentificacion) VALUES ($1, $2)', 
                     [idMessenger,idClient], 
                     (err) => {
                         done();
                         if (err) return res.status(500).send(err.message);
                         res.status(200).send('Mensajero relacionado');
                     });
    });
});

app.post('/addService', (req, res) => {
    const { code, date, time, origin, destination, description, transport, packages, IdClient } = req.body;
    const timestamp = `${date} ${time}`;
    
    const queryDate = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);

        const query = `
            INSERT INTO servicio 
            (codigo, fechaYHoraDeSolicitud, origen, destino, descripcion, numeroDePaquetes, tipoDeTransporte, estado, fechaYHoraDelEstado, cIdentificacion) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const values = [code, timestamp, origin, destination, description, packages, transport, 'Solicitado', queryDate, IdClient];

        client.query(query, values, (err) => {
            done();
            if (err) {
                return res.status(500).send(err.message);
            }
            res.status(200).send('Service added');
        });
    });
});

app.post('/addUser', (req, res) => {
    const { login, password, address, email, phone, role} = req.body;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('INSERT INTO usuario (rol, login, contrasena, direccion, email, telefonoDeContacto, cIdentificacion) VALUES ($1, $2, $3, $4, $5, $6, NULL)', 
                     [role, login, password, address, email, phone], 
                     (err) => {
                         done();
                         if (err) return res.status(500).send(err.message);
                         res.status(200).send('User added');
                     });
    });
});

app.post('/modifyService', async (req, res) => {
    const { codeS, status } = req.body;
    const queryDate = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});

    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);

        const query = `
            UPDATE servicio 
            SET estado = $1, fechaYHoraDelEstado = $2
            WHERE codigo = $3
        `;
        const values = [status, queryDate, codeS];

        client.query(query, values, (err) => {
            done();
            if (err) {
                return res.status(500).send(err.message);
            }
            res.status(200).send('Servicio modificado');
        });
    });
});

app.get('/monitorService/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query('SELECT estado, fechaYHoraDelEstado, descripcion FROM servicio WHERE codigo = $1', [codigo], (err, result) => {
            done();
            if (err) return res.status(500).send(err.message);
            if (result.rows.length === 0) {
                return res.status(404).send('Servicio no encontrado');
            }
            res.status(200).json(result.rows[0]);
        });
    });
});

// Generar reporte de servicios por cliente
app.get('/reportes/servicios-por-cliente', (req, res) => {
    const { clienteId, mes, ano } = req.query;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query(`SELECT * FROM servicio WHERE cIdentificacion = $1 AND EXTRACT(MONTH FROM fechaYHoraDeSolicitud) = $2 AND EXTRACT(YEAR FROM fechaYHoraDeSolicitud) = $3`, 
                     [clienteId, mes, ano], (err, result) => {
            done();
            if (err) return res.status(500).send(err.message);
            const doc = new PDFDocument();
            res.setHeader('Content-Disposition', `attachment; filename=reporte_servicios_cliente_${clienteId}_${mes}_${ano}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text(`Reporte de Servicios del Cliente ${clienteId} para ${mes}/${ano}`, { align: 'center' });
            doc.moveDown();
            result.rows.forEach(row => {
                doc.fontSize(12).text(`Código: ${row.codigo}`);
                doc.text(`Fecha y Hora de Solicitud: ${row.fechayhoradesolicitud}`);
                doc.text(`Origen: ${row.origen}`);
                doc.text(`Destino: ${row.destino}`);
                doc.text(`Descripción: ${row.descripcion}`);
                doc.text(`Número de Paquetes: ${row.numerodepaquetes}`);
                doc.text(`Tipo de Transporte: ${row.tipodetransporte}`);
                doc.text(`Estado: ${row.estado}`);
                doc.text(`Fecha y Hora del Estado: ${row.fechayhoradelestado}`);
                doc.text('-----------------------');
            });
            doc.end();
        });
    });
});

// Generar reporte de servicios por mensajero
app.get('/reportes/servicios-por-mensajero', (req, res) => {
    const { mensajeroId, mes, ano } = req.query;
    connect((err, client, done) => {
        if (err) return res.status(500).send(err.message);
        client.query(`SELECT * FROM servicio WHERE mIdentificacion = $1 AND EXTRACT(MONTH FROM fechaYHoraDeSolicitud) = $2 AND EXTRACT(YEAR FROM fechaYHoraDeSolicitud) = $3`, 
                     [mensajeroId, mes, ano], (err, result) => {
            done();
            if (err) return res.status(500).send(err.message);
            const doc = new PDFDocument();
            res.setHeader('Content-Disposition', `attachment; filename=reporte_servicios_mensajero_${mensajeroId}_${mes}_${ano}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text(`Reporte de Servicios del Mensajero ${mensajeroId} para ${mes}/${ano}`, { align: 'center' });
            doc.moveDown();
            result.rows.forEach(row => {
                doc.fontSize(12).text(`Código: ${row.codigo}`);
                doc.text(`Fecha y Hora de Solicitud: ${row.fechayhoradesolicitud}`);
                doc.text(`Origen: ${row.origen}`);
                doc.text(`Destino: ${row.destino}`);
                doc.text(`Descripción: ${row.descripcion}`);
                doc.text(`Número de Paquetes: ${row.numerodepaquetes}`);
                doc.text(`Tipo de Transporte: ${row.tipodetransporte}`);
                doc.text(`Estado: ${row.estado}`);
                doc.text(`Fecha y Hora del Estado: ${row.fechayhoradelestado}`);
                doc.text('-----------------------');
            });
            doc.end();
        });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Listening on port 3000');
});