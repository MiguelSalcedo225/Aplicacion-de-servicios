-- Trigger para actualizar el estado de un servicio
CREATE TRIGGER actualizar_estado_servicio
AFTER INSERT ON estado
FOR EACH ROW
BEGIN
    UPDATE servicio
    SET eIdentificacion = NEW.identificacion
    WHERE codigo = (SELECT codigo FROM servicio WHERE eIdentificacion = NEW.identificacion);

    UPDATE estado
    SET fechaYHoraDelEstado = NOW()
    WHERE identificacion = NEW.identificacion;
END;

