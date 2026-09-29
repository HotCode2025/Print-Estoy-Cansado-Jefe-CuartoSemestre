
-- Comenzamos con CRUD: create(insertar), read(leer), update(actualizar), delete(eliminar)
-- Listar los estudiantes (read)
SELECT * FROM estudiantes2025;
-- Insertar estudiante
INSERT INTO estudiantes2025(nombre, apellido, telefono, email) VALUES ("Juan","Perez", "2614545456", "juan@mail.com" );
-- Update (modificar)
UPDATE estudiantes2025 SET nombre="Juan Carlos", apellido="Garcia" WHERE idestudiantes2025= 1;
-- Delete(eliminar)
DELETE FROM estudiantes2025 WHERE idestudiantes2025=2;
-- Para modificar el idestudiantes2025 y comience en 1
ALTER TABLE estudiantes2025 AUTO_INCREMENT = 1;