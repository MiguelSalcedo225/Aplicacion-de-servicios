-- Ejemplos de consultas útiles que prueban la validez del modelo desarrollado.
-- Seleccionar todos los usuarios:
SELECT * FROM usuario;

-- Seleccionar todas las sucursales:
SELECT * FROM sucursal;

-- Contar el número total de clientes:
SELECT COUNT(*) AS total_clientes FROM cliente;

-- Listar todas las ciudades donde hay clientes:
SELECT DISTINCT ciudad FROM cliente;

-- Seleccionar todos los servicios con la información del cliente que los solicitó y el estado actual del servicio:
SELECT s.codigo, s.fechaYHoraDeSolicitud, s.origen, s.destino, c.nombre AS nombre_cliente, c.direccion AS direccion_cliente, e.estado AS estado_actual, e.fechaYHoraDelEstado
FROM servicio s
JOIN cliente c ON s.cIdentificacion = c.identificacion
JOIN estado e ON s.eIdentificacion = e.identificacion;

-- Seleccionar todos los servicios con información detallada del cliente y mensajero asignado:
SELECT s.codigo, s.fechaYHoraDeSolicitud, s.origen, s.destino, c.nombre AS nombre_cliente, c.direccion AS direccion_cliente, m.nombre AS nombre_mensajero, m.medioDeTransporte, e.estado AS estado_actual, e.fechaYHoraDelEstado
FROM servicio s
JOIN cliente c ON s.cIdentificacion = c.identificacion
JOIN mensajero_cliente mc ON mc.identificacion = s.codigo
JOIN mensajero m ON mc.mIdentificacion = m.identificacion
JOIN estado e ON s.eIdentificacion = e.identificacion;

-- Seleccionar todas las sucursales junto con la información del cliente correspondiente:
SELECT su.nombre AS nombre_sucursal, su.direccion AS direccion_sucursal, su.telefonoDeContacto AS telefono_sucursal, c.nombre AS nombre_cliente, c.ciudad AS ciudad_cliente
FROM sucursal su
JOIN cliente c ON su.cIdentificacion = c.identificacion;

-- Contar el número de servicios por estado:
SELECT e.estado, COUNT(s.codigo) AS total_servicios
FROM estado e
JOIN servicio s ON e.identificacion = s.eIdentificacion
GROUP BY e.estado;

-- Seleccionar todos los usuarios junto con la información del cliente correspondiente:
SELECT u.login, u.email, u.direccion, u.telefonoDeContacto, c.nombre AS nombre_cliente, c.ciudad AS ciudad_cliente
FROM usuario u
JOIN cliente c ON u.cIdentificacion = c.identificacion;

-- Seleccionar los servicios realizados por un mensajero específico con ID = 1:
SELECT s.codigo, s.fechaYHoraDeSolicitud, s.origen, s.destino, c.nombre AS nombre_cliente, c.direccion AS direccion_cliente, e.estado AS estado_actual, e.fechaYHoraDelEstado
FROM servicio s
JOIN cliente c ON s.cIdentificacion = c.identificacion
JOIN mensajero_cliente mc ON mc.identificacion = s.codigo
JOIN mensajero m ON mc.mIdentificacion = m.identificacion
JOIN estado e ON s.eIdentificacion = e.identificacion
WHERE m.identificacion = 1;

-- Consultas con condiciones adicionales:

-- Seleccionar los clientes de una ciudad específica (por ejemplo, 'Bogotá'):
SELECT * FROM cliente WHERE ciudad = 'Bogotá';

-- Seleccionar los servicios que requieren un tipo de transporte específico (por ejemplo, 'moto'):
SELECT * FROM servicio WHERE tipoDeTransporte = 'moto';

-- Seleccionar los servicios solicitados en una fecha específica (por ejemplo, '2024-05-01'):
SELECT * FROM servicio WHERE DATE(fechaYHoraDeSolicitud) = '2024-05-01';

-- Seleccionar los servicios en un rango de fechas:
SELECT * FROM servicio WHERE fechaYHoraDeSolicitud BETWEEN '2024-05-01' AND '2024-05-31';

-- Seleccionar los servicios de un cliente específico con ID = 2:
SELECT s.*, c.nombre AS nombre_cliente
FROM servicio s
JOIN cliente c ON s.cIdentificacion = c.identificacion
WHERE c.identificacion = 2;

-- Seleccionar los servicios que aún no han sido entregados:
SELECT s.*, e.estado AS estado_actual
FROM servicio s
JOIN estado e ON s.eIdentificacion = e.identificacion
WHERE e.estado != 'Entregado';

-- Contar el número de servicios por tipo de transporte:
SELECT tipoDeTransporte, COUNT(*) AS total_servicios
FROM servicio
GROUP BY tipoDeTransporte;

-- Seleccionar los clientes que han solicitado más de 5 servicios:
SELECT c.nombre AS nombre_cliente, COUNT(s.codigo) AS total_servicios
FROM cliente c
JOIN servicio s ON c.identificacion = s.cIdentificacion
GROUP BY c.nombre
HAVING COUNT(s.codigo) > 5;

-- Seleccionar los mensajeros que han realizado servicios en un rango de fechas:
SELECT m.nombre AS nombre_mensajero, COUNT(s.codigo) AS total_servicios
FROM mensajero m
JOIN mensajero_cliente mc ON m.identificacion = mc.mIdentificacion
JOIN servicio s ON mc.identificacion = s.codigo
WHERE s.fechaYHoraDeSolicitud BETWEEN '2024-05-01' AND '2024-05-31'
GROUP BY m.nombre;



SELECT * FROM servicio WHERE cIdentificacion = 1 AND EXTRACT(MONTH FROM fechaYHoraDeSolicitud) = 5 AND EXTRACT(YEAR FROM fechaYHoraDeSolicitud) = 2024
