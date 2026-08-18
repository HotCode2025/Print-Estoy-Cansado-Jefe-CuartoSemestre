-- Comenzamos con CRUD: create(insertar), read(leer), update(actualizar), delete(eliminar)
-- Listar los estudiantes (read)
SELECT * FROM estudiantes2026;
-- Insertar estudiante
INSERT INTO estudiantes2026 (nombre, apellido, telefono, email) VALUES ("Jorge", "Gomez", "3426098022", "jorge@mail.com");
-- update  (modificar, actualizar)
UPDATE estudiantes2026 SET nombre="Miguel", apellido="Garcia" WHERE idestudiantes2026= 1;
-- delete (eliminar)
DELETE FROM estudiantes2026 WHERE idestudiantes2026= 3;
-- Para modificar el idestudiantes2026 y comience en 1
ALTER TABLE estudiantes2026 AUTO_INCREMENT = 1;