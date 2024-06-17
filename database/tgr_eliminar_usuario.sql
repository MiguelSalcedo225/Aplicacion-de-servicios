CREATE TRIGGER eliminar_usuario_servicios
BEFORE DELETE ON usuario
FOR EACH ROW
BEGIN
    -- Eliminar los servicios asociados al usuario
    DELETE FROM servicio WHERE cIdentificacion = OLD.cIdentificacion;
END;
